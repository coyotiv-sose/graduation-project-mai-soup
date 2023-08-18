const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  let lineBreak
  if (req.accepts('html')) {
    lineBreak = '<br />'
  } else {
    lineBreak = '\n'
  }

  const teapot = `                                                /
                                               /
                               xxX###xx       /
                                ::XXX        /
                         xxXX::::::###XXXXXx/#####
                    :::XXXXX::::::XXXXXXXXX/    ####
         xXXX//::::::://///////:::::::::::/#####    #         ##########
      XXXXXX//:::::://///xXXXXXXXXXXXXXXX/#    #######      ###   ###
     XXXX        :://///XXXXXXXXX######X/#######      #   ###    #
     XXXX        ::////XXXXXXXXX#######/ #     #      ####   #  #
      XXXX/:     ::////XXXXXXXXXX#####/  #     #########      ##
       ""XX//::::::////XXXXXXXXXXXXXX/###########     #       #
           "::::::::////XXXXXXXXXXXX/    #     #     #      ##
                 ::::////XXXXXXXXXX/##################   ###
                     ::::://XXXXXX/#    #     #   #######
                         ::::::::/################
                                /
                               /
                              /
                        I am a teapot.`

  if (req.accepts('html')) {
    const formattedString = `<pre>${teapot}</pre>`
    return res.status(418).send(formattedString.split('\n').join(lineBreak))
  }
  return res.status(418).send("I'm a teapot")
})

module.exports = router
