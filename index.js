'use strict'
const util = require('util')
const createTorrent = require('create-torrent')
const fs = require('fs')
const FormData = require('form-data')


module.exports = {
  generateTorrent: async function(args) {
    /*
      args: {
        torrent_name,         //Name of the torrent
        source_directory,     //Location of chapters
        manga_id              //ID of the manga
        torrent_file_path,    //Where the .torrent-file should be saved
      }
    */

    //Use create-torrent to generate a torrent-file
    try {
      var torrent = await util.promisify(createTorrent)(
        args.source_directory,
        {
          name: args.torrent_name,
          comment: 'https://mangadex.org/manga/' + args.manga_id,
          createdBy: 'mangadex-archive',
          announceList: [
            ['http://anidex.moe:6969/announce']
          ],
          private: true
        }
      )
    } catch(err) {
      return Promise.reject(err)
    }

    // Save to file
    try {
      await util.promisify(fs.writeFile)(
        args.torrent_file_path,
        torrent
      )
    } catch(err) {
      return Promise.reject(err)
    }

    return Promise.resolve()
  },

  postTorrent: function(args) {
    /*
      torrent_file_path,    //Where the .torrent-file is located at
      anidex_description,   //Description for anidex
      anidex_hentai,        //Is the manga considered adult content
      anidex_subcat_id,
      anidex_api_key,
      anidex_private,
      anidex_debug
    */

    return new Promise((resolve, reject) => {
      // Prepare
      let form = new FormData({})
      form.append('file', fs.createReadStream(args.torrent_file_path))
      form.append('subcat_id', args.anidex_subcat_id)
      form.append('group_id', 0) // no group
      form.append('lang_id', 1) // English
      form.append('description', args.anidex_description)
      form.append('batch', 1)
      form.append('hentai', args.anidex_hentai)
      form.append('api_key', args.anidex_api_key)
      form.append('debug', args.anidex_debug)
      form.append('private', args.anidex_private)

      form.submit('https://anidex.info/api/', function (err, res) {
        if (err !== null) {
          return reject(err)
        }

        let data = '';
        res.resume()
          .on('error', (err) => {
            reject(err)
          })
          .on('data', (chunk) => {
            data += chunk
          })
          .on('end', () => {
            //console.log("API upload response:", res.statusCode, res.body, data)
            let rx = /https:\/\/anidex\.info\/torrent\/(\d+)/i
            let arr = rx.exec(data)
            
            if (arr && arr[1] != null) {
              resolve(parseInt(arr[1]))
            } else if (data.includes('Upload would have succeeded, congratulations.')) {
              resolve(0)
            } else {
              console.error("API upload response:", data)
              reject(new Error('No id could be extracted from the API response'))
            }
          })
      })
    })
  }
}
