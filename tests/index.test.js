'use strict'
const fs = require('fs')
const os = require('os')
const crypto = require('crypto')
const torrentProcessor = require(`${__dirname}/../index`)


describe('generateTorrent()', () => {
    test('Generates a torrent', async () => {
        expect.assertions(0)
        await torrentProcessor.generateTorrent({
            torrent_name: 'torrent-processor-test',
            source_directory: `${__dirname}/files`,
            manga_id: 99,
            torrent_file_path: fs.realpathSync(os.tmpdir()) + '/' + crypto.randomBytes(20).toString('hex')
        })
    })
    test('Rejects on createTorrent errors', async () => {
        expect.assertions(2)
        try {
            await torrentProcessor.generateTorrent({
                torrent_name: 'torrent-processor-test',
                source_directory: 'non-existent://createTorrent-err',
                manga_id: 99,
                torrent_file_path: fs.realpathSync(os.tmpdir()) + '/' + crypto.randomBytes(20).toString('hex')
            })
        } catch (err) {
            expect(err).toHaveProperty('code', 'ENOENT')
            expect(err).toHaveProperty('path', 'non-existent://createTorrent-err')
        }
    })
    test('Rejects on writeFile errors', async () => {
        expect.assertions(2)
        try {
            await torrentProcessor.generateTorrent({
                torrent_name: 'torrent-processor-test',
                source_directory: `${__dirname}/files`,
                manga_id: 99,
                torrent_file_path: `non-existent://writeFile-err`
            })
        } catch (err) {
            expect(err).toHaveProperty('code', 'ENOENT')
            expect(err).toHaveProperty('path', 'non-existent://writeFile-err')
        }
    })
})

describe('postTorrent()', () => {
    test('Posts a torrent', async () => {
        expect.assertions(1)
        return expect(torrentProcessor.postTorrent({
                torrent_file_path: `${__dirname}/files/test.bin.torrent`,
                anidex_description: 'test123',
                anidex_hentai: 0,
                anidex_subcat_id: 7,
                anidex_api_key: process.env.ANIDEX_APIKEY,
                anidex_private: 0,
                anidex_debug: 1
            }))
            .resolves
            .toBe(0)
    })
    test('Rejects on form.submit errors', async () => {
        expect.assertions(1)
        try {
            await torrentProcessor.postTorrent({
                torrent_file_path: `${__dirname}/files/test.bin.torrent`,
                anidex_description: 'test123',
                anidex_hentai: 0,
                anidex_subcat_id: 7,
                anidex_api_key: process.env.ANIDEX_APIKEY,
                anidex_private: 0,
                anidex_debug: 1,
                post_url: 'http://submit-err'
            })
        } catch (err) {
            expect(err).toHaveProperty('code', 'EAI_AGAIN')
        }
    })
    test('Rejects on API errors', async () => {
        expect.assertions(1)
        try {
            await torrentProcessor.postTorrent({
                torrent_file_path: `${__dirname}/files/test.bin.torrent`,
                anidex_description: 'test123',
                anidex_hentai: 0,
                anidex_subcat_id: 7,
                anidex_api_key: '',
                anidex_private: 0,
                anidex_debug: 1
            })
        } catch (err) {
            expect(err).toHaveProperty('code', 'ERR_UNEXPECTED_API_RESPONSE')
        }
    })
})
