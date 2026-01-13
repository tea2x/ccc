pnpm install
pnpm build
cd packages/core
jq '.name = "ckb-ccc-core-light-client-js-patch"' package.json > tmp.json && mv tmp.json package.json
npm pack