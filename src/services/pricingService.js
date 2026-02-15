// fare calculation - base + per km, then discount when more passengers
const PRICING = {
  baseFare: 50,
  perKmRate: 15,
  poolingDiscount: { 1: 1.0, 2: 0.7, 3: 0.55, 4: 0.45, 5: 0.4, 6: 0.35 },
};

function calculateFare(distanceKm, passengerCount, surge) {
  if (surge == null) surge = 1.0;
  const totalCost = PRICING.baseFare + distanceKm * PRICING.perKmRate;
  const poolFactor = PRICING.poolingDiscount[passengerCount] || 0.35;
  const perPerson = (totalCost * poolFactor * surge) / passengerCount;
  return Math.round(perPerson);
}

const getSurgeMultiplier = async () => {
  return 1.0;
};

module.exports = {
  calculateFare,
  getSurgeMultiplier,
};
