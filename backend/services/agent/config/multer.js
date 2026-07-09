import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("./temp");

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {

        recursive: true

    });

}

const storage = multer.diskStorage({

    destination(req,file,cb){

        cb(null,uploadDir);

    },

    filename(req,file,cb){

        cb(

            null,

            `${Date.now()}-${file.originalname}`

        );

    }

});

const fileFilter=(req,file,cb)=>{

    if(

        file.mimetype==="application/pdf" ||

        file.mimetype.startsWith("image/") ||

        file.mimetype==="text/plain" ||

        file.mimetype==="application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    ){

        cb(null,true);

    }

    else{

        cb(

            new Error(

                "Only PDF, Images, DOCX, and TXT are allowed."

            )

        );

    }

};

export default multer({

    storage,

    fileFilter,

    limits:{

        fileSize:20*1024*1024

    }

});