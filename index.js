import { app } from "./src/express.js";
import { logger } from "./src/logger.js";

// Listen on port set in environment variable or default to 3000
var listener = app.listen(3000, function () {
  logger.info('Your app is listening on port ' + listener.address().port);
});
