function assertProviderContract(provider) {
  if (!provider || typeof provider !== 'object') {
    throw new Error('Ingestion provider must be an object.');
  }

  const required = ['name', 'source', 'entityType', 'fetchPage'];
  const missing = required.filter((field) => !provider[field]);
  if (missing.length) {
    throw new Error(`Provider is missing required fields: ${missing.join(', ')}`);
  }

  if (typeof provider.fetchPage !== 'function') {
    throw new Error(`Provider ${provider.name} must define fetchPage({ cursor }).`);
  }
}

module.exports = {
  assertProviderContract,
};
