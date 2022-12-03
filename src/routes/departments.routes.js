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
async function checkDepto(req, res, next) {
    const depto = await DB.Departmens.getById(req.params.id);
    if (!depto) {
        return res.status(404).send('Departamento no encontrado!!!')
    }
    // se guarda el objeto encontrado en la propiedad locals
    // para que pueda ser usado en los siguientes eslabones de la cadena
    res.locals.depto = depto;
    next();
}


// GET /api/v1/departamentos
router.get('/', async (req, res) => {
    const deptos = await DB.Departmens.getAll();
    res.status(200).json(deptos)
});

// GET /api/v1/departamentos/:id
router.get('/:id', checkDepto, (req, res) => {
    res.status(200).json(res.locals.depto);
});

// GET /api/v1/departamentos/:id/manager
router.get('/:id/manager', checkDepto, async (req, res) => {
    const manager = await DB.Departmens.getActualManager(res.locals.depto);
    res.status(200).json(manager)
});


// POST /api/v1/departamentos
router.post('/', async (req, res) => {
    const { dept_no, dept_name } = req.body
    if (!dept_no) {
        res.status(400).send('dept_no es Requerido!!!')
        return
    }
    if (!dept_name) {
        res.status(400).send('dept_name es Requerido!!!')
        return
    }
    const depto = await DB.Departmens.getById(dept_no);
    if (depto) {
        res.status(500).send('ya existe el Departamento!!!')
        return
    }
    const deptoNuevo = { dept_no, dept_name }
    const isAddOk = await DB.Departmens.add(deptoNuevo)
    if (isAddOk) {
        res.status(201).json(deptoNuevo)
    } else {
        res.status(500).send('Falló al agregar el departamento!!!')
    }
});

// PUT /api/v1/departamentos/:id
router.put('/:id', checkDepto, async (req, res) => {
    const { dept_name } = req.body
    if (!dept_name) {
        res.status(400).send('dept_name es Requerido!!!')
        return
    }
    const { depto } = res.locals;
    depto.dept_name = dept_name
    const isUpdateOk = await DB.Departmens.update(depto)
    if (isUpdateOk) {
        res.status(200).json(depto)
    } else {
        res.status(500).send('Falló al modificar el departamento!!!')
    }
});

// DELETE /api/v1/departamentos/:id
router.delete('/:id', checkDepto, async (req, res) => {
    const { depto } = res.locals;
    const isDeleteOk = await DB.Departmens.delete(depto)
    if (isDeleteOk) {
        res.status(204).send()
    } else {
        res.status(500).send('Falló al eliminar el departamento!!!')
    }
});

// GET /api/v1/departamentos/:id/manager/last
router.get("/:id/manager/last", checkDepto, async (req, res) => {
    const getActualManager = await DB.Departmens.getLastEmp(res.locals.depto.dept_no);
    res.status(200).json(getActualManager);
});

// GET /api/v1/departamentos/:id/manager
router.get('/:id/manager/all', checkDepto, async (req, res) => {
    const managers = await DB.Departmens.getAllMan(res.locals.depto);
    res.status(200).json(managers)
});

// PUT /api/v1/departamentos/:id/manager
router.put('/:id/manager',checkDepto, async (req, res) => {
    const { emp_no } = req.body
    if (!emp_no) {
        res.status(400).send('emp_no es Requerido!!!')
        return
    }
    const num_emp = await DB.Employees.getById(emp_no);
    if (!num_emp) {
        return res.status(404).send('Empleado no encontrado!!!')
    }
    const actualEmp = await DB.Departmens.getLastEmp(res.locals.depto.dept_no);
    if (emp_no == actualEmp.emp_no) {
        res.status(500).send('el manager es el mismo!!!')
        return
    }
    const dept_no = res.locals.depto.dept_no;
    const managerNuevo = { emp_no, dept_no }
    const isUpdateOk = await DB.Departmens.updateManager(managerNuevo)
    if (isUpdateOk) {
        res.status(201).json(managerNuevo)
    } else {
        res.status(500).send('Falló al agregar el salario!!!')
    }
});

module.exports = router