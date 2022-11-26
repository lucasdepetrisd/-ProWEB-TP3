const express = require("express");
const router = express.Router();
const DB = require("../db");

/**
 * Middleware para verificar que existe el empleado con parámetro id
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns
 */

async function checkEmpleado(req, res, next) {
    const empleado = await DB.Employees.getById(req.params.id);
    if (!empleado) {
        return res.status(404).send("Empleado no encontrado!!!");
    }
    // se guarda el objeto encontrado en la propiedad locals
    // para que pueda ser usado en los siguientes eslabones de la cadena
    res.locals.empleado = empleado;
    next();
}

// GET /api/v1/empleados
router.get("/", async (req, res) => {
    const emp = await DB.Employees.getAll();
    res.status(200).json(emp);
});

// GET /api/v1/empleados/:id
router.get("/:id", checkEmpleado, (req, res) => {
    res.status(200).json(res.locals.empleado);
});

// GET /api/v1/empleados/:id/salaries
router.get("/:id/salaries", checkEmpleado, async (req, res) => {
    const salarios = await DB.Employees.getAllSalaries(res.locals.empleado);
    res.status(200).json(salarios);
});

// GET /api/v1/empleados/:id/salaries/last
router.get("/:id/salaries/last", checkEmpleado, async (req, res) => {
    const salario = await DB.Employees.getLastSalary(res.locals.empleado.emp_no);
    res.status(200).json(salario);
});

// POST /api/v1/empleados/:id/salaries
router.post('/', async (req, res) => {
    const { emp_no, salary } = req.body
    if (!emp_no) {
        res.status(400).send('emp_no es Requerido!!!')
        return
    }
    if (!salary) {
        res.status(400).send('salary es Requerido!!!')
        return
    }
    const salario = await DB.Employees.getLastSalary(emp_no);
    if (salario.salary == salary) {
        res.status(500).send('ya existe el salario!!!')
        return
    }
    const salarioNuevo = { emp_no, salary }
    const isAddOk = await DB.Employees.add(salarioNuevo)
    if (isAddOk) {
        res.status(201).json(salarioNuevo)
    } else {
        res.status(500).send('Falló al agregar el salario!!!')
    }
});

module.exports = router;
