import Agents from '../models/Agents.mjs'



export default class mainController {

  static async login(req, res) {
    const { user, password } = req.body
    try {
        const agentsData = await Agents.findOne({where:{
          user,
          password
        }})
        if (!agentsData) {
          return res.status(200).json({
            message: "Agent does not exist."
          })
        }
        res.status(200).json(agentsData)
    } catch (error) {
      res.status(500).json("error")
    }
  }

}
