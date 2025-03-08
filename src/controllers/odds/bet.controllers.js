// controllers/betController.js
const db = require('@models/index');

const betController = {
  // Place a bet and handle match/odds creation
  // async placeBet(req, res) {
  //   const transaction = await db.sequelize.transaction(); // Start a transaction for safety
  //   try {
  //     const { matchId, winner, betOdds, stake, sport, betType, teams,commence_time } = req.body;

  //     // Step 1: Create or find the match
  //     let matchRecord = await db.match.findOne({
  //       where: {
  //         homeTeam: teams.home,
  //         awayTeam: teams.away,
  //         matchDate: matchId,
  //         sport: sport || 'unspecified',
  //       },
  //       transaction,
  //     });

  //     if (!matchRecord) {
  //       matchRecord = await db.match.create({
  //           homeTeam: teams.home,
  //           awayTeam: teams.away,
  //           matchDate: matchId,
  //           matchDate: commence_time,
  //           sport: sport || 'unspecified',
  //           status: 'upcoming', // Default status
  //         },{ transaction });
  //     } else if (matchRecord.status !== 'upcoming') {
  //       throw new Error('Betting is closed for this match');
  //     }

  //     // Step 2: Create or find the odds for this match
  //     let oddsRecord = await db.odds.findOne({
  //       where: { matchId: matchRecord.id },
  //       transaction,
  //     });

  //     if (!oddsRecord) {
  //       oddsRecord = await db.odds.create(
  //         {
  //           matchId: matchRecord.id,
  //           homeTeamOdds: 5,
  //           awayTeamOdds: betOdds,
  //         },
  //         { transaction }
  //       );
  //     }


  //     const userId = req.user.id

  //     // Step 3: Validate user and balance
  //     const user = await db.user.findByPk(userId, { transaction });
  //     if (!user) throw new Error('User not found');
  //     if (user.balance < stake) throw new Error('Insufficient balance');

  //     // Step 4: Calculate payout based on betType
  //     const payoutMultiplier = betType === 'home' ? oddsRecord.homeTeamOdds : oddsRecord.awayTeamOdds;
  //     const potentialPayout = stake * payoutMultiplier;

  //     // Step 5: Create the bet
  //     const betRecord = await db.bet.create(
  //       {
  //         userId:userId,
  //         matchId,
  //         oddsId: oddsRecord.id,
  //         betType: betType,
  //         amount: stake,
  //         potentialPayout,
  //         status: 'pending',
  //       },
  //       { transaction }
  //     );

  //     // Step 6: Update user balance
  //     user.balance -= stake;
  //     await user.save({ transaction });

  //     // Step 7: Commit the transaction
  //     await transaction.commit();

  //     // Send back the created records
  //     res.status(201).json({
  //       match: matchRecord,
  //       odds: oddsRecord,
  //       bet: betRecord,
  //     });
  //   } catch (error) {
  //     await transaction.rollback(); // Roll back if anything fails
  //     console.error(error);
  //     res.status(400).json({ message: error.message || 'Error placing bet' });
  //   }
  // },

  async placeBet(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      // Check if the body is an array, if not convert to array for consistent processing
      const bets = Array.isArray(req.body) ? req.body : [req.body];
      const results = [];

      for (const bet of bets) {
        const { matchId, winner, betOdds, stake, sport, betType, teams, comment_time: commence_time } = bet;

        // Step 1: Create or find the match
        let matchRecord = await db.match.findOne({
          where: {
            homeTeam: teams.home,
            awayTeam: teams.away,
            matchDate: matchId,
            sport: sport || 'unspecified',
          },
          transaction,
        });

        if (!matchRecord) {
          matchRecord = await db.match.create({
            homeTeam: teams.home,
            awayTeam: teams.away,
            matchDate: matchId,
            matchDate: commence_time,
            sport: sport || 'unspecified',
            status: 'upcoming',
          }, { transaction });
        } else if (matchRecord.status !== 'upcoming') {
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
              homeTeamOdds: betType === 'home' ? betOdds : 5,
              awayTeamOdds: betType === 'away' ? betOdds : 5,
            },
            { transaction }
          );
        }

        const userId = req.user.id;

        // Step 3: Validate user and balance
        const user = await db.user.findByPk(userId, { transaction });
        if (!user) throw new Error('User not found');
        if (user.balance < stake) throw new Error(`Insufficient balance`);

        // Step 4: Calculate payout
        const payoutMultiplier = betType === 'home' ? oddsRecord.homeTeamOdds : oddsRecord.awayTeamOdds;
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
            status: 'pending',
            winner: winner
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

      // Step 7: Commit the transaction
      await transaction.commit();

      // Send back all created records
      res.status(201).json(results);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(400).json({ message: error.message || 'Error placing bets' });
    }
  },

  // Optional: Get user bets (if you still want this)
  async getUserBets(req, res) {
    try {
      const userId = req.params.userId;
      const bets = await db.bet.findAll({
        where: { userId },
        include: [
          { model: db.match, attributes: ['homeTeam', 'awayTeam', 'matchDate', 'sport', 'result'] },
          { model: db.odds, attributes: ['homeTeamOdds', 'awayTeamOdds'] },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.status(200).send({
        success: true,
        data: bets,
        message: 'Retrived Data Sucessfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching user bets' });
    }
  },
};

module.exports = betController;