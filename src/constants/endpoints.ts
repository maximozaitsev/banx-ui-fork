export const RPC_ENDPOINTS = [
  process.env.RPC_LOCALHOST || '',
  'https://mainnet.helius-rpc.com/?api-key=d283785c-6f2c-43de-b460-a938327fc6f5',
  'https://smart-powerful-knowledge.solana-mainnet.discover.quiknode.pro/887d337202841789c5a6d168e1c3b7809e45d268/',
  'https://solana-mainnet.rpc.extrnode.com/',
  'https://rpc.hellomoon.io/51e91377-d146-4f74-bf41-c4b11d42cebe',
].filter(Boolean)
