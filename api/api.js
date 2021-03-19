
const express = require("express");
const app = express();
const multer = require('multer');
const router = express.Router()
const fs = require('fs');

const {spawn} = require('child_process');

var upload = multer({ dest: './api/ChessTutorModels/data/input_images' })


// this is once we've already gotten to api/
router.post('*', upload.single('chessboard'), function(req, res){
    console.log(req.file);
    var dataToSend;
    var jsonToSend;
    //console.log(req.file)
    const python = spawn('python3', ['./api/ChessTutorModels/get_fen_from_image.py'])
    //const python = spawn('python3', ['~/personal/StreamlineChessTutor/get_fen_from_image.py'])

    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
        let lines = dataToSend.split('\n')
        if(lines.length != 3){
            jsonToSend ={
                // Error
                'code': 1
            }

        }
        jsonToSend = {
            'code': lines[0],
            'crop': lines[1],
            'fen': lines[2]
        }
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.json(jsonToSend)
        // delete all files in the folder
        let folder= './api/ChessTutorModels/data/input_images'
        fs.readdir(folder, (err, files)=>{
            if (err) console.log(err);
                for (const file of files) {
                    fs.unlink(folder+'/'+file, err => {
                        if (err) console.log(err);
                    });
                }
        })
    });


})
module.exports = router
