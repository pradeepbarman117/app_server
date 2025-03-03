const db = require('@models/index')

const matchController = {
    // Create a new match
    async createMatch(req, res) {
      try {
        const { homeTeam, awayTeam, matchDate, sport } = req.body;
        const match = await db.match.create({
          homeTeam,
          awayTeam,
          matchDate,
          sport,
          status: 'upcoming', // Default status
        });
        res.status(201).json(match);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating match' });
      }
    },
  
    // Get all matches (e.g., for display in frontend)
    async getAllMatches(req, res) {
      try {
        const matches = await db.match.findAll({
          where: { status: 'upcoming' }, // Optional: filter for upcoming matches
          order: [['matchDate', 'ASC']],
        });
        res.status(200).json(matches);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching matches' });
      }
    },
  
    // Get a single match by ID
    async getMatchById(req, res) {
      try {
        const match = await db.match.findByPk(req.params.id);
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.status(200).json(match);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching match' });
      }
    },
  };
  
  module.exports = matchController;