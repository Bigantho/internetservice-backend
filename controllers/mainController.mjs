import Agents from '../models/Agents.mjs'


export default class mainController {

  static async login(req, res) {
    const { user, password } = req.body
    console.log(user, password)
    try {
      const agentsData = await Agents.findOne({
        where: {
          user,
          password
        }
      })
      const url = `${process.env.WEBAPP_PROTOCOL}://${process.env.WEBAPP_HOST}:${process.env.WEBAPP_PORT}`
      if (!agentsData) {
        // return res.status(200).json({
        //   message: "Agent does not exist."
        // })
        res.redirect('payment')

      }
      // res.status(200).json(agentsData)
      res.redirect('payment')

    } catch (error) {
      res.status(500).json("error")
    }
  }

}
