//Estamos configurando el servidor 

import app from "./app";

const PORT: number = 5000;

app.listen(PORT, () => {
  console.log(`SERVER RUNNING AT ${PORT}`);
});