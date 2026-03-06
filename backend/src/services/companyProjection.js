const companyWithLatestScore = {
  scoreSnapshots: {
    orderBy: { snapshotDate: 'desc' },
    take: 1,
  },
};

function toCompanyWithLatestScore(company) {
  return {
    ...company,
    latestScore: company.scoreSnapshots[0] ?? null,
    scoreSnapshots: undefined,
  };
}

module.exports = {
  companyWithLatestScore,
  toCompanyWithLatestScore,
};
