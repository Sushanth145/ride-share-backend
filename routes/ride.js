const express = require('express');
const router = express.Router();
const RideRequest = require('../models/RideRequest');
const { getDistanceFromLatLonInMeters } = require('../utils/distance');
const User = require('../models/User');
const haversine = require('../utils/distance');
const Ride = require('../models/Ride');



router.post('/request', async (req, res) => {
  const { userId, from, to } = req.body;

  const newRequest = await RideRequest.create({
    userId,
    from,
    to,
    status: 'pending'
  });

  const potentialMatches = await RideRequest.find({
    status: 'pending',
    userId: { $ne: userId }
  });

  for (const match of potentialMatches) {
    const distance = haversine.getDistanceFromLatLonInMeters(
      from.lat, from.lng,
      match.from.lat, match.from.lng
    );

    if (distance <= 100) {
      // Same starting point — now check destinations

      const distA = haversine.getDistanceFromLatLonInMeters(from.lat, from.lng, to.lat, to.lng);
      const distB = haversine.getDistanceFromLatLonInMeters(match.from.lat, match.from.lng, match.to.lat, match.to.lng);

      const totalFare = 100; // base fare (you can make this dynamic later)

      const totalDist = distA + distB;

      const fareA = Math.round((distA / totalDist) * totalFare);
      const fareB = totalFare - fareA;

      await RideRequest.findByIdAndUpdate(newRequest._id, {
        matchedWith: match.userId,
        status: 'matched',
        fare: fareA
      });

      await RideRequest.findByIdAndUpdate(match._id, {
        matchedWith: userId,
        status: 'matched',
        fare: fareB
      });

      const matchedUser = await User.findById(match.userId);
      return res.json({
        message: 'Matched with user going nearby!',
        matchedWith: {
          name: matchedUser.name,
          phone: matchedUser.phone,
          destination: match.to
        },
        fare: fareA,
        fareBreakup: {
          youPay: fareA,
          theyPay: fareB,
          totalFare
        }
      });
    }
  }

  res.json({ message: 'No match found yet. Waiting...' });
});




// POST /api/ride/confirm
router.post('/confirm', async (req, res) => {
  const { userId } = req.body;

  const request = await RideRequest.findOne({ userId });

  if (!request || request.status !== 'matched') {
    return res.status(400).json({ error: 'No matched ride to confirm' });
  }

  // Mark current user as confirmed
  request.status = 'confirmed';
  await request.save();

  // Check if the matched user has also confirmed
  const partnerRequest = await RideRequest.findOne({ userId: request.matchedWith });

  if (partnerRequest && partnerRequest.status === 'confirmed') {
    // Both confirmed → create ride
    const ride = await Ride.create({
      users: [request.userId, partnerRequest.userId],
      from: request.from,
      destinations: [
        { userId: request.userId, to: request.to },
        { userId: partnerRequest.userId, to: partnerRequest.to }
      ],
      fares: new Map([
        [request.userId.toString(), request.fare],
        [partnerRequest.userId.toString(), partnerRequest.fare]
      ])
    });

    // Delete ride requests (optional)
    await RideRequest.deleteMany({
      userId: { $in: [request.userId, partnerRequest.userId] }
    });

    return res.json({ message: 'Ride confirmed!', ride });
  }

  res.json({ message: 'Waiting for the other user to confirm...' });
});


module.exports = router;

