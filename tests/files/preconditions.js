'use strict'
if (process.env.ANIDEX_APIKEY !== undefined) {
    process.exit(0)
} else {
    console.error('No Anidex API key set.')
    console.error('You can do that by using then environment variable "ANIDEX_APIKEY"')
    console.error('Aborting..')
    process.exit(1)
}