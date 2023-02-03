
const express = require("express");
const app = express();
const multer = require('multer');
const router = express.Router()
const fs = require('fs');
const path = require('path');

const {spawn} = require('child_process');

// This will strictly increase, problem if we have many many uploads between resets
// to combat this we will reset it every 10000
var files_uploaded = 1;
var storage = multer.diskStorage({ 
    destination: function(req, file, cb){
        files_uploaded = (files_uploaded + 1 % 10000);
        const path ="./api/ChessTutorModels/data/input_images/"+files_uploaded+"/";
        fs.mkdirSync(path, { recursive: true })
        cb(null, path)
    },
    filename: function(req, file, cb){
        original_extension = path.extname(file.originalname);
        cb(null,files_uploaded + original_extension);
    },
});

var upload = multer({
    storage:storage,
});

// this is once we've already gotten to api/
router.post('*', upload.single('chessboard'), function(req, res){
    let dataToSend;
    let jsonToSend;
    let error = "";

    const file = req.file;
    const file_folder = path.dirname(file.path);
    const file_number = files_uploaded
    const python = spawn('python3', ['./api/ChessTutorModels/get_fen_from_image.py', path.dirname(file.path), file_number])

    python.stdout.on('data', function (data) {
        // No news is good news
        error = data.toString();
        console.log("stdout: " + error)
    });

    python.stderr.on('data', function (data) {
        // No news is good news
        error = data.toString();
        console.log("stderror: " + error)
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        // open up the file attached to this

        // delete all files in the folder
        fs.rm(file_folder, {recursive:true, force:true }, err => {
            if (err) console.log(err);
        });
        // we should do this in for the cropped folder too we know what it is, it's files_uploaded
        fs.rm('api/ChessTutorModels/data/cropped/'+file_number, {recursive:true, force:true}, err => {
            if (err) console.log(err);
        });

        // get the data from the file
        fs.readFile('api/ChessTutorModels/data/output_files/'+file_number+".txt", (err, data)=>{
            if(err){
                jsonToSend = {
                    'code': '1',
                    'error':err
                }
                res.json(jsonToSend)
                return
            }
            const file_string = new Buffer.from(data).toString();
            let lines = file_string.split("\n")
            jsonToSend = {
                'code': lines[0],
                'crop': lines[1],
                'fen': lines[2]
            }
            // send data to browser
            res.json(jsonToSend)
        })
        fs.rm('api/ChessTutorModels/data/output_files/'+file_number+'.txt', {recursive:true, force:true}, err => {
            if (err) console.log(err);
        });
    });


})
module.exports = router
