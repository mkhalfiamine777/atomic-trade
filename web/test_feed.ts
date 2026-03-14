import { getMixedFeedLogic } from './src/services/feedService'

async function main() {
    console.log('Testing feed fetch...')
    const data = await getMixedFeedLogic(1, 10)
    console.log(`Feed returned ${data.length} items.`)
    console.log(JSON.stringify(data, null, 2))
}

main().catch(console.error)
