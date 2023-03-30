import { createConnection } from 'mysql';
import * as dotenv from 'dotenv';


var config = dotenv.config(".env").parsed

const connection = createConnection({
    host: config["DB_HOSTNAME"],
    database: config["DB_DATABASE"],
    user: config["DB_USERNAME"],
    password: config["DB_PASSWORD"]
});

connection.connect(function(error) {
    if (error) {
        console.log("Failed to connect to database")
        console.log(error);
    } else {
        console.log('MySQL Database is connected Successfully');
    }
});
export default connection;