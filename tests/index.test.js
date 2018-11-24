'use strict'
const fs = require('fs')
const os = require('os')
const crypto = require('crypto')
const torrentProcessor = require(`${__dirname}/../index`)


test('.generateTorrent()', () => {
    expect.assertions(1)
    return expect(torrentProcessor.generateTorrent({
            torrent_name: 'torrent-processor-test',
            source_directory: `${__dirname}/files`,
            manga_id: 99,
            torrent_file_path: fs.realpathSync(os.tmpdir()) + '/' + crypto.randomBytes(20).toString('hex')
        }))
        .resolves
        .toEqual()
})

test('.postTorrent()', () => {
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