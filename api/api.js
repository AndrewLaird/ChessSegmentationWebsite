
const express = require("express");
const app = express();
const multer = require('multer');
const router = express.Router()
const fs = require('fs');

const {spawn} = require('child_process');

var upload = multer({ dest: 'api/ChessTutorModels/data/input_images' })


// this is once we've already gotten to api/
router.post('*', upload.single('chessboard'), function(req, res){
    var dataToSend;
    var jsonToSend;
    //console.log(req.file)
    const python = spawn('python3', ['./api/ChessTutorModels/get_fen_from_image.py'])
    //const python = spawn('python3', ['~/personal/StreamlineChessTutor/get_fen_from_image.py'])

    python.stdout.on('data', function (data) {
        dataToSend = data.toString();
        let lines = dataToSend.split('\n')
        jsonToSend = {
            'code': lines[0],
            'crop': lines[1],
            'fen': lines[2]
        }
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
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
        // send data to browser
        res.json(jsonToSend)
    });


})
module.exports = router
