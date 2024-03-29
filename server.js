//criando o meu objeto
const express = require('express')
const objeto = express()
const banco_de_dados = require('./banco_de_dados.js')
const md5 = require("md5")
//porta do meu servidor
const porta_http = 3000


objeto.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });

objeto.listen(porta_http, () => {
    console.log(`Servidor rodando na porta ${porta_http}`)
});

//GET
//definindo o endpoint root
objeto.get('/', (request, response, next) => {
    response.json({"message": "Api está no ar!"})
});

//definindo o endpoint dos usuarios 
objeto.get('/tarefas', (request, response, next) => {
    const sql = 'SELECT * from tarefas'
    const lista = []
    banco_de_dados.all(sql, lista, (err, rows) => {
        if(err){
            response.status(400).json({"error":err.message});
            return;
        }
        response.json({
            //"message": "Sucesso!",
            "data": rows
        })
    });
});
//endpoint para exibir usuario pelo id
objeto.get("/tarefas/:id", (req, res, next) => {
    var sql = "select * from tarefas where id = ?"
    var params = [req.params.id]
    banco_de_dados.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            //"message":"Exibindo tarefa pelo id",
            "data":row
        })
      });
});
//POST
//postando valores

var bodyParser = require("body-parser");
objeto.use(bodyParser.urlencoded({ extended: false }));
objeto.use(bodyParser.json());

objeto.post("/tarefas/", (req, res, next) => {
    var errors=[]
    if (!req.body.titulo){
        errors.push("Nenhuma tarefa especificada");
    }
    if (!req.body.feito){
        errors.push("Nenhum estado especificado");
    }
    if (errors.length){
        res.status(400).json({"Os erros cometidos foram:":errors.join(",")});
        return;
    }
    var data = {
        titulo: req.body.titulo,
        feito: req.body.feito
    }
    var sql ='INSERT INTO tarefas (titulo, feito) VALUES (?,?)'
    var params =[data.titulo, data.feito]
    banco_de_dados.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "Nova tarefa postada com sucesso",
            "data": data,
            "id" : this.lastID
        })
    });
})

//PATCH
//atualizando valores
objeto.patch("/tarefas/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : null
    }
    banco_de_dados.run(
        `UPDATE tarefas set 
           titulo = COALESCE(?,titulo), 
           feito = COALESCE(?,feito),  
           WHERE id = ?`,
        //aqui usar o método coalesce para manter o valor atual caso ele não seja nulo
        [data.titulo, data.feito, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "Tarefa atualizada com Sucesso",
                data: data,
                changes: this.changes
            })
    });
})

//DELETE
objeto.delete("/tarefas/:id", (req, res, next) => {
    banco_de_dados.run(
        'DELETE FROM tarefas WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"Tarefa deletado com sucesso!", changes: this.changes})
    });
})