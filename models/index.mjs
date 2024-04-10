import Users from '../models/Users.mjs'
import CreditCards from '../models/CreditCards.mjs';
import Payments from '../models/Payments.mjs';
import Clients from '../models/Clients.mjs'


Users.associate();
Payments.associate();
// CreditCards.associate(models);
// Clients.associate(models);

// const models = {
//   Users,
//   CreditCards,
//   Payments,
//   Clients
// };



export  {
  Users,
  CreditCards,
  Payments,
  Clients
};
