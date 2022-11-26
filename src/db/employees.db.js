const pool = require("./connection.db");
const TABLE = 'employees'

/**
 * Retorna todos los empleados
 * @returns 
 */
module.exports.getAll = async function () {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE} d `);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna un empleado por su clave primaria
 * @returns 
 */
module.exports.getById = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE} d WHERE emp_no=?`, [id]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna el historial de salarios de un empleado y las fechas desde
 * @param {Object} empleado 
 * @returns 
 */
module.exports.getAllSalaries = async function (empleado) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
      SELECT
      s.salary,
      s.from_date,
      s.to_date
      FROM salaries s
      INNER JOIN employees e USING (emp_no)
      WHERE emp_no=?
      ORDER BY to_date
  `;
    const rows = await conn.query(SQL, [empleado.emp_no]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna el salario actual de un empleado por su id y las fechas desde
 * @param {Object} empleado 
 * @returns 
 */
 module.exports.getLastSalary = async function (emp_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
      SELECT
      s.salary,
      s.from_date,
      s.to_date
      FROM salaries s
      INNER JOIN employees e USING (emp_no)
      WHERE emp_no=? AND to_date='9999-01-01'
  `;
    const row = await conn.query(SQL, [emp_no]);
    return row[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Agrega un salario
 * @param {Object} salario
 * @returns
 */
 module.exports.add = async function (salario) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQLUpdate = `UPDATE salaries SET to_date=CURRENT_DATE() WHERE to_date='9999-01-01' AND emp_no=?`;
    await conn.query(SQLUpdate, [salario.emp_no]);

    const SQLInsert = `INSERT INTO salaries VALUES(?, ?, CURRENT_DATE(), '9999-01-01')`;
    const params = [];
    params[0] = salario.emp_no;
    params[1] = salario.salary;
    const rows = await conn.query(SQLInsert, params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};