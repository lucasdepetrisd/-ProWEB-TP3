const pool = require("./connection.db");
const TABLE='employees'

/**
 * Retorna todos los departamentos
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
      const rows = await conn.query(`SELECT * FROM ${TABLE} d WHERE dept_no=?`,[id]);
      return rows[0];
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) await conn.release();
    }
  };

/**
 * Retorna el salario actual de un empleado y la fecha desde
 * @param {Object} empleado 
 * @returns 
 */

 module.exports.getActualSalario = async function (empleado) {
    let conn;
    try {
      conn = await pool.getConnection();
      const SQL=`
  SELECT 
    e.*,
    dm.from_date AS fecha_desde
  FROM dept_manager dm
      INNER JOIN employees e ON (e.emp_no = dm.emp_no)
  WHERE dm.dept_no = ? AND dm.to_date='9999-01-01'
  `;
      const rows = await conn.query(SQL,[empleado.emp_no]);
      return rows[0];
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) await conn.release();
    }
  };
  