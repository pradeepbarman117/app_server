// controllers/betController.js
const db = require('@models/index');

const betController = {
  // Place a bet and handle match/odds creation
  async placeBet(req, res) {
    const transaction = await db.sequelize.transaction(); // Start a transaction for safety
    try {
      const { match, odds, bet } = req.body;

      // Step 1: Create or find the match
      let matchRecord = await db.match.findOne({
        where: {
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          matchDate: match.matchDate,
          sport: match.sport,
        },
        transaction,
      });

      if (!matchRecord) {
        matchRecord = await db.match.create({
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            matchDate: match.matchDate,
            sport: match.sport,
            status: 'upcoming', // Default status
          },{ transaction });
      } else if (matchRecord.status !== 'upcoming') {
        throw new Error('Betting is closed for this match');
      }

      // Step 2: Create or find the odds for this match
      let oddsRecord = await db.odds.findOne({
        where: { matchId: matchRecord.id },
        transaction,
      });

      if (!oddsRecord) {
        oddsRecord = await db.odds.create(
          {
            matchId: matchRecord.id,
            homeTeamOdds: odds.homeTeamOdds,
            awayTeamOdds: odds.awayTeamOdds,
          },
          { transaction }
        );
      }


      const userId = req.user.id

      // Step 3: Validate user and balance
      const user = await db.user.findByPk(userId, { transaction });
      if (!user) throw new Error('User not found');
      if (user.balance < bet.amount) throw new Error('Insufficient balance');

      // Step 4: Calculate payout based on betType
      const payoutMultiplier = bet.betType === 'home' ? oddsRecord.homeTeamOdds : oddsRecord.awayTeamOdds;
      const potentialPayout = bet.amount * payoutMultiplier;

      // Step 5: Create the bet
      const betRecord = await db.bet.create(
        {
          userId: bet.userId,
          matchId: matchRecord.id,
          oddsId: oddsRecord.id,
          betType: bet.betType,
          amount: bet.amount,
          potentialPayout,
          status: 'pending',
        },
        { transaction }
      );

      // Step 6: Update user balance
      user.balance -= bet.amount;
      await user.save({ transaction });

      // Step 7: Commit the transaction
      await transaction.commit();

      // Send back the created records
      res.status(201).json({
        match: matchRecord,
        odds: oddsRecord,
        bet: betRecord,
      });
    } catch (error) {
      await transaction.rollback(); // Roll back if anything fails
      console.error(error);
      res.status(400).json({ message: error.message || 'Error placing bet' });
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
        success:true,
        data:bets,
        message:'Retrived Data Sucessfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching user bets' });
    }
  },
};

module.exports = betController;