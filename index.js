const createTorrent = require('create-torrent');
const fs = require('fs');
const FormData = require('form-data');
const torrent_directory = './';

module.exports = {
  generateTorrent: (arguments, cb) => {
    /*
      arguments: {
        torrent_name,         //Name of the torrent
        source_directory,     //Location of chapters
        manga_id              //ID of the manga
        torrent_file_path,    //Where the .torrent-file should be saved
      }
    */

    //Use create-torrent to generate a torrent-file
    createTorrent(
      arguments.source_directory,
      {
        name: arguments.torrent_name,
        comment: 'https://mangadex.org/manga/' + arguments.manga_id,
        createdBy: 'mangadex-archive',
        announceList: [
          ['http://anidex.moe:6969/announce']
        ],
        private: true
      },
      (createTorrent_err, torrent) => {
        //Abort if createTorrent failed
        if (createTorrent_err) {
          return cb({
            code: 301,
            message: 'Creating the torrent failed',
            error: createTorrent_err
          });
        }

        //Save file
        fs.writeFile(arguments.torrent_file_path, torrent, (writeFile_err) => {
          //Abort if saving the torrent-file failed
          if (writeFile_err) {
            return cb({
              code: 302,
              message: 'Saving the torrent-file failed',
              error: writeFile_err
            });
          }

          //All ok
          cb(null);
        });
      }
    );
  },
  postTorrent: (arguments, cb) => {
    /*
      torrent_file_path,    //Where the .torrent-file is located at
      anidex_description,   //Description for anidex
      anidex_hentai,         //Is the manga considered adult content
      anidex_subcat_id,
      anidex_api_key,
      anidex_private,
      anidex_debug
    */

    //Upload to anidex

    let form = new FormData({});
    form.append('file', fs.createReadStream(arguments.torrent_file_path));
    form.append('subcat_id', arguments.anidex_subcat_id);
    form.append('group_id', 0); // no group
    form.append('lang_id', 1); // English
    form.append('description', arguments.anidex_description);
    form.append('batch', 1);
    form.append('hentai', arguments.anidex_hentai);
    form.append('api_key', arguments.anidex_api_key);
    form.append('debug', arguments.anidex_debug);
    form.append('private', arguments.anidex_private);
    form.submit('https://anidex.info/api/', function (err, res) {
        if (err) {
            console.error("API upload error:", err);
            cb(false);
        } else {
            let data = "";
            res.resume()
                .on('data', (chunk) => {
                    data += chunk;
                })
                .on('end', () => {
                    //console.log("API upload response:", res.statusCode, res.body, data);
                    let rx = /https:\/\/anidex\.info\/torrent\/(\d+)/i;
                    let arr = rx.exec(data);
                    cb(arr && arr[1] != null ? parseInt(arr[1]) : -1);
                });
        }
    });
  }
};
