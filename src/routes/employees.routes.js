const express = require('express');
const router = express.Router();
const DB = require('../db');

/**
 * Middleware para verificar que existe el departamento con parámetro id
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 * @returns 
 */

 async function checkEmpleado(req,res,next){
    const empleado = await DB.Employees.getById(req.params.id);
    if(!empleado){        
        return res.status(404).send('Empleado no encontrado!!!')
    }
    // se guarda el objeto encontrado en la propiedad locals
    // para que pueda ser usado en los siguientes eslabones de la cadena
    res.locals.empleado=empleado;
    next();
}


// GET /api/v1/empleados
router.get('/',async (req,res)=>{
    const emp = await DB.Employees.getAll();    
    res.status(200).json(emp)
});

// GET /api/v1/departamentos/:id
router.get('/:id',checkEmpleado,(req,res)=>{
    res.status(200).json(res.locals.empleado);    
});

// GET /api/v1/empleados/:id/salarios
router.get('/:id/salaries',checkEmpleado,async (req,res)=>{    
    const salario = await DB.Employees.getActualSalario(res.locals.empleado);
    res.status(200).json(salario)
});
