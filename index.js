const createTorrent = require('create-torrent');
const fs = require('fs');
const torrent_directory = './';
const anidex = require('./anidex');

module.exports = {
  processDirectory: (arguments, cb) => {
    /*
      arguments: {
        source_directory,     //Location of chapters
        manga_id              //ID of the manga
        torrent_file_path,    //Where the .torrent-file should be saved
        anidex_description,   //Description for anidex
        anidex_hentai         //Is the manga considered adult content
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
          'http://anidex.moe:6969/announce',
          'udp://tracker.openbittorrent.com:80',
          'udp://tracker.internetwarriors.net:1337',
          'udp://tracker.leechers-paradise.org:6969',
          'udp://tracker.coppersurfer.tk:6969',
          'udp://exodus.desync.com:6969',
          'wss://tracker.btorrent.xyz',
          'wss://tracker.openwebtorrent.com',
          'wss://tracker.fastcast.nz'
        ]
      },
      (createTorrent_err, torrent) => {
        //Abort if createTorrent failed
        if (createTorrent_err) {
          return cb({
            code: 301,
            message: 'Creating the torrent failed',
            error: createTorrent_err
          }, null);
        }

        //Save file
        fs.writeFile(arguments.torrent_file_path, (writeFile_err) => {
          //Abort if saving the torrent-file failed
          if (writeFile_err) {
            return cb({
              code: 302,
              message: 'Saving the torrent-file failed',
              error: writeFile_err
            }, null);
          }

          //Upload to anidex
          anidex.postTorrent(arguments.torrent_file_path, (anidex_err) => {
            //Abort if upload failed
            if (anidex_err) {
              return cb({
                code: 303,
                message: 'Uploading the torrent-file failed',
                error: anidex_err
              }, null);
            }
          });
        });
      }
    );
  }
}
