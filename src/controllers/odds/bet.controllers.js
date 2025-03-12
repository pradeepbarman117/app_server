// controllers/betController.js
const db = require("@models/index");
const { redisClient } = require("../../config/redis");
const { Op } = require("sequelize");

const betController = {
  ////////////////////////////  ADMIN CONTROLLERS  ////////////////////////////
  getBetsListByAdmin: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
      const offset = (page - 1) * limit;

      // Extract betId from query for search
      const { betId } = req.query;

      // Build where clause
      const whereClause = {};
      if (betId) {
        whereClause.id = { [Op.like]: `%${betId}%` }; // Partial match for bet ID
      }

      const CACHE_KEY = `admin:bets:list:page:${page}:limit:${limit}:betId:${
        betId || "all"
      }`;
      const CACHE_EXPIRY = 30; // Cache expiry time in seconds

      // Check Redis cache
      const cachedBets = await redisClient.get(CACHE_KEY);
      if (cachedBets) {
        const cachedData = JSON.parse(cachedBets);
        const flattenedData = cachedData.data ? cachedData.data : cachedData;

        return res.status(200).send({
          success: true,
          message: "Retrieved All Bets from cache",
          data: flattenedData,
          pagination: cachedData.pagination,
          source: "cache",
        });
      }

      // Get total count for pagination
      const totalItems = await db.bet.count({
        where: whereClause,
      });

      // Fetch bets with pagination and search
      const bets = await db.bet.findAll({
        where: whereClause,
        include: [
          {
            model: db.match,
            attributes: [
              "homeTeam",
              "awayTeam",
              "matchDate",
              "sport",
              "status",
              "result",
            ],
          },
          {
            model: db.odds,
            attributes: ["homeTeamOdds", "awayTeamOdds"],
          },
          {
            model: db.user,
            attributes: ["id", "userId", "email"],
            as: "user", // Assuming there's a user association
          },
        ],
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

      const totalPages = Math.ceil(totalItems / limit);

      const responseData = {
        data: bets,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
        },
      };

      // Store in cache
      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(responseData)
      );

      return res.status(200).send({
        success: true,
        message: "Retrieved All Bets",
        data: bets,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
        },
        source: "database",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  },

  // Place a bet and handle match/odds creation
  async placeBet(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const userId = req.user.id;
      // Check if the body is an array, if not convert to array for consistent processing
      const bets = Array.isArray(req.body) ? req.body : [req.body];
      const results = [];

      for (const bet of bets) {
        const {
          matchId,
          winner,
          betOdds,
          stake,
          sport,
          betType,
          teams,
          comment_time: commence_time,
        } = bet;

        // Step 1: Create or find the match
        let matchRecord = await db.match.findOne({
          where: {
            homeTeam: teams.home,
            awayTeam: teams.away,
            matchDate: matchId,
            sport: sport || "unspecified",
          },
          transaction,
        });

        if (!matchRecord) {
          matchRecord = await db.match.create(
            {
              homeTeam: teams.home,
              awayTeam: teams.away,
              matchDate: matchId,
              matchDate: commence_time,
              sport: sport || "unspecified",
              status: "upcoming",
            },
            { transaction }
          );
        } else if (matchRecord.status !== "upcoming") {
          throw new Error(`Betting is closed for match ${matchId}`);
        }

        // Step 2: Create or find the odds
        let oddsRecord = await db.odds.findOne({
          where: { matchId: matchRecord.id },
          transaction,
        });

        if (!oddsRecord) {
          oddsRecord = await db.odds.create(
            {
              matchId: matchRecord.id,
              homeTeamOdds: betType === "home" ? betOdds : 5,
              awayTeamOdds: betType === "away" ? betOdds : 5,
            },
            { transaction }
          );
        }

        const userId = req.user.id;

        // Step 3: Validate user and balance
        const user = await db.user.findByPk(userId, { transaction });
        if (!user) throw new Error("User not found");
        if (user.balance < stake) throw new Error(`Insufficient balance`);

        // Step 4: Calculate payout
        const payoutMultiplier =
          betType === "home"
            ? oddsRecord.homeTeamOdds
            : oddsRecord.awayTeamOdds;
        const potentialPayout = stake * payoutMultiplier;

        // Step 5: Create the bet
        const betRecord = await db.bet.create(
          {
            userId: userId,
            matchId: matchRecord.id,
            oddsId: oddsRecord.id,
            betType: betType,
            amount: stake,
            potentialPayout,
            status: "pending",
            winner: winner,
          },
          { transaction }
        );

        // Step 6: Update user balance
        user.balance -= stake;
        await user.save({ transaction });

        // Store the result
        results.push({
          match: matchRecord,
          odds: oddsRecord,
          bet: betRecord,
        });
      }

      await redisClient.del(`user:${userId}`);
      // Step 7: Commit the transaction
      await transaction.commit();

      // Send back all created records
      res.status(201).json(results);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(400).json({ message: error.message || "Error placing bets" });
    }
  },
  async getUserBets(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 5; // Default to 10 items per page
      const offset = (page - 1) * limit;

      // Extract requestId from query for search
      const { requestId } = req.query;

      // Build where clause
      const whereClause = {
        userId,
      };

      if (requestId) {
        whereClause.id = { [Op.like]: `%${requestId}%` }; // Partial match for requestId
      }

      const CACHE_KEY = `user:bets:${userId}:page:${page}:limit:${limit}:requestId:${
        requestId || "all"
      }`;
      const CACHE_EXPIRY = 30; // Cache expiry time in seconds

      // Check if data exists in cache
      const cachedBets = await redisClient.get(CACHE_KEY);

      if (cachedBets) {
        const cachedData = JSON.parse(cachedBets);
        const flattenedData = cachedData.data ? cachedData.data : cachedData;

        return res.status(200).send({
          success: true,
          data: flattenedData,
          pagination: cachedData.pagination,
          source: "cached",
          message: "Retrieved Data Successfully",
        });
      }

      // Get total count for pagination
      const totalItems = await db.bet.count({
        where: whereClause,
      });

      // Fetch bets with pagination and search
      const bets = await db.bet.findAll({
        where: whereClause,
        include: [
          {
            model: db.match,
            attributes: [
              "homeTeam",
              "awayTeam",
              "matchDate",
              "sport",
              "result",
            ],
          },
          { model: db.odds, attributes: ["homeTeamOdds", "awayTeamOdds"] },
        ],
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

      const totalPages = Math.ceil(totalItems / limit);

      // Prepare response data with pagination
      const responseData = {
        data: bets,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
        },
      };

      // Store in cache
      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(responseData)
      );

      return res.status(200).send({
        success: true,
        data: bets,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
        },
        message: "Retrieved Data Successfully",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching user bets" });
    }
  },
};

module.exports = betController;
