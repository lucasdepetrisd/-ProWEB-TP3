require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");

describe("Rest API Empleados", () => {
  it("GET /api/v1/empleados", async () => {
    const response = await request(app).get("/api/v1/empleados");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const empleados = response.body;
    expect(empleados.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/empleados/100001/", async () => {
    const response = await request(app).get("/api/v1/empleados/100001/");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const empleado = response.body;
    expect(empleado).toBeDefined();
    expect(empleado.emp_no).toBeDefined();
    expect(empleado.emp_no).toBe(100001);
  });

  it("GET /api/v1/empleados/100001/salaries", async () => {
    const response = await request(app).get("/api/v1/empleados/100001/salaries");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const salarios = response.body;
    expect(salarios.length).toBeGreaterThan(1);
    salarios.forEach(sal => {
      expect(sal).toBeDefined();
      expect(sal.emp_no).toBeDefined();
      expect(sal.emp_no).toBe(100001);
    });
  });

  it("GET /api/v1/empleados/100001/salaries/last", async () => {
    const response = await request(app).get("/api/v1/empleados/100001/salaries/last");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const lastSal = response.body;
    expect(lastSal).toBeDefined();
    expect(lastSal.emp_no).toBeDefined();
    expect(lastSal.emp_no).toBe(100001);
    expect(lastSal.to_date).toBeDefined();
    expect(lastSal.to_date).toBe("9999-01-01T03:00:00.000Z");
  });

  /*--------------------------------------------*/
  /**
   * Pruebas de errores en datos de entrada
   */

  it("GET /api/v1/empleados/1", async () => {
    const response = await request(app).get("/api/v1/empleados/1");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("Empleado no encontrado!!!");
  });

  it("GET /api/v1/empleados/1/salaries", async () => {
    const response = await request(app).get("/api/v1/empleados/1/salaries");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("Empleado no encontrado!!!");
  });

  it("GET /api/v1/empleados/1/salaries/last", async () => {
    const response = await request(app).get("/api/v1/empleados/1/salaries/last");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("Empleado no encontrado!!!");
  });

  /*--------------------------------------------*/
  /**
   * Pruebas inserción y eliminación de último salario
   */
  it("Verificar que agrega con POST /api/v1/empleados", async () => {
    const salarioNuevo = {
      emp_no: 100001,
      salary: 96000
    }

    const response = await request(app)
      .post("/api/v1/empleados")
      .send(salarioNuevo);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual(salarioNuevo);

    //verificar que un objeto obtenido de la api coincide con el agregado
    const responseGET = await request(app).get("/api/v1/empleados/100001/salaries/last");
    expect(responseGET).toBeDefined();
    expect(responseGET.statusCode).toBe(200);
    expect(responseGET.body.emp_no).toStrictEqual(salarioNuevo.emp_no);
    expect(responseGET.body.salary).toStrictEqual(salarioNuevo.salary);

    const responseDEL = await request(app)
      .delete("/api/v1/empleados/100001/salaries/last");
    expect(responseDEL).toBeDefined();
    expect(responseDEL.statusCode).toBe(204);
  });

  
  it("Verificación después de ejecutar POST /api/v1/empleados", async () => {
    const salarioNuevo = {
      emp_no: 100001,
      salary: 55000
    }

    const response = await request(app)
      .post("/api/v1/empleados")
      .send(salarioNuevo);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual(salarioNuevo);

    //verificar que un objeto obtenido de la api coincide con el agregado
    const responseGET = await request(app).get("/api/v1/empleados/100001/salaries/last");
    expect(responseGET).toBeDefined();
    expect(responseGET.statusCode).toBe(200);
    expect(responseGET.body.emp_no).toStrictEqual(salarioNuevo.emp_no);
    expect(responseGET.body.salary).toStrictEqual(salarioNuevo.salary);

    const salaries = await request(app).get("/api/v1/empleados/100001/salaries");
    const antSal = salaries.body[salaries.body.length-2];
    const ultSal = salaries.body[salaries.body.length-1];
    const today = new Date().setHours(0, 0, 0, 0);
    expect(Date.parse(antSal.to_date)).toBe(today);
    expect(Date.parse(ultSal.from_date)).toBe(today);

    const responseDEL = await request(app)
      .delete("/api/v1/empleados/100001/salaries/last");
    expect(responseDEL).toBeDefined();
    expect(responseDEL.statusCode).toBe(204);
  });

  
  /*--------------------------------------------*/
  /**
   * Pruebas gestión de empleados en departamentos
   */

  it("Verificar que modifica con PUT /api/v1/empleados/100001/departamento", async () => {
    const deptoNuevo = { depto_no: "d009" };

    // Verificamos que el empleado exista
    const resEmp = await request(app).get("/api/v1/empleados/100001/");
    expect(resEmp).toBeDefined();
    expect(resEmp.statusCode).toBe(200);
    const empleado = resEmp.body;
    expect(empleado).toBeDefined();
    expect(empleado.emp_no).toBeDefined();
    expect(empleado.emp_no).toBe(100001);

    // Verificamos que el departamento destino exista
    const resDep = await request(app).get("/api/v1/departamentos/d009");
    expect(resDep).toBeDefined();
    expect(resDep.statusCode).toBe(200);
    const depar = resDep.body;
    expect(depar).toBeDefined();
    expect(depar.dept_no).toBeDefined();
    expect(depar.dept_no).toBe("d009");
    expect(depar.dept_name).toBeDefined();
    expect(depar.dept_name).toBe("Customer Service");

    // Verificamos que el departamento destino sea distinto al departamento actual
    const resDepAct = await request(app).get("/api/v1/empleados/100001/departamento/last");
    expect(resDepAct).toBeDefined();
    expect(resDepAct.statusCode).toBe(200);
    const deparAct = resDepAct.body;
    expect(deparAct).toBeDefined();
    expect(deparAct.dept_no).toBeDefined();
    expect(deparAct.dept_no).not.toMatch(deptoNuevo.depto_no);

    //Ahora modificamos con PUT
    const responseUpdate = await request(app)
      .put("/api/v1/empleados/100001/departamento")
      .send(deptoNuevo); //enviamos la copia
    expect(responseUpdate).toBeDefined();
    expect(responseUpdate.statusCode).toBe(201);
    expect(responseUpdate.body.depto_no).toStrictEqual(deptoNuevo.depto_no); //verificamos con la copia para verificar

    const registro = await request(app).get("/api/v1/empleados/100001/departamento");
    const antDpto = registro.body[registro.body.length-2];
    const ultDpto = registro.body[registro.body.length-1];
    const today = new Date().setHours(0, 0, 0, 0);
    expect(Date.parse(antDpto.to_date)).toBe(today);
    expect(Date.parse(ultDpto.from_date)).toBe(today);
    expect(ultDpto.to_date).toBe("9999-01-01T03:00:00.000Z");
    expect(ultDpto.dept_no).toBe(deptoNuevo.depto_no);
    
    //Vuelvo a dejar el manager que estaba
    const responseDelete = await request(app)
      .delete("/api/v1/empleados/100001/departamento/last")
      .send();
    expect(responseDelete).toBeDefined();
    expect(responseDelete.statusCode).toBe(204);
  });
  
  /*--------------------------------------------*/

});
