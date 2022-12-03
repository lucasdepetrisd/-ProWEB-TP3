require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");

describe("Rest API Departamentos", () => {
  it("GET /api/v1/departamentos", async () => {
    const response = await request(app).get("/api/v1/departamentos");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const deptos = response.body;
    expect(deptos.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/departamentos/d009", async () => {
    const response = await request(app).get("/api/v1/departamentos/d009");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const depto = response.body;
    expect(depto).toBeDefined();
    expect(depto.dept_no).toBeDefined();
    expect(depto.dept_no).toBe("d009");
    expect(depto.dept_name).toBeDefined();
    expect(depto.dept_name).toBe("Customer Service");
  });

  it("GET /api/v1/departamentos/d009/manager", async () => {
    const response = await request(app).get("/api/v1/departamentos/d009/manager");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const manager = response.body;
    expect(manager).toBeDefined();
    expect(manager.emp_no).toBeDefined();
    expect(manager.emp_no).toBe(111939);
    expect(manager.first_name).toBeDefined();
    expect(manager.first_name).toBe("Yuchang");
  });

  it("GET /api/v1/departamentos/d00999", async () => {
    const response = await request(app).get("/api/v1/departamentos/d00999");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("Departamento no encontrado!!!");
  });

  it("POST /api/v1/departamentos  sin parámetros", async () => {
    const response = await request(app).post("/api/v1/departamentos").send();
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("dept_no es Requerido!!!");
  });

  it("POST /api/v1/departamentos  sólo con dept_no", async () => {
    const depto = { dept_no: "d999" };
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("dept_name es Requerido!!!");
  });

  it("POST /api/v1/departamentos  sólo con dept_name", async () => {
    const depto = { dept_name: "Depto nueve nueve nueve" };
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("dept_no es Requerido!!!");
  });

  it("POST /api/v1/departamentos  departamento repetido!!!", async () => {
    const depto = { dept_no: "d009", dept_name: "Depto Cero Cero Nueve" };
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("ya existe el Departamento!!!");
  });

  it("Verificar que agrega con POST /api/v1/departamentos", async () => {
    const depto = { dept_no: "d999", dept_name: "Depto nueve nueve nueve" };
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual(depto);

    //verificar que un objeto obtenido de la api conicide con el agregado
    const responseGET = await request(app).get("/api/v1/departamentos/d999");
    expect(responseGET).toBeDefined();
    expect(responseGET.statusCode).toBe(200);
    expect(responseGET.body).toStrictEqual(depto);

    // luego eliminar
    const responseDelete = await request(app)
      .delete("/api/v1/departamentos/d999")
      .send();
    expect(responseDelete).toBeDefined();
    expect(responseDelete.statusCode).toBe(204);
  });

  it("Verificar que modifica con PUT /api/v1/departamentos", async () => {
    const depto = { dept_no: "d999", dept_name: "Depto nueve nueve nueve" };
    //Primero Agregamos
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual(depto);

    //Ahora modificamos con PUT
    const deptoCopia = { ...depto }; //clonamos el objeto
    deptoCopia.dept_no = "este código no lo tiene en cuenta";
    deptoCopia.atributoAdicional =
      "a este atributo adicional tampoco lo tiene en cuenta";
    deptoCopia.dept_name = "Departamento 999"; //modifica el nombre del departamento
    const responseUpdate = await request(app)
      .put("/api/v1/departamentos/d999") // en la url debe ir la clave
      .send(deptoCopia); //enviamos la copia
    expect(responseUpdate).toBeDefined();
    expect(responseUpdate.statusCode).toBe(200);
    const deptoCopiaVerificar = { ...depto }; //clonamos el objeto
    deptoCopiaVerificar.dept_name = "Departamento 999"; //modifica el nombre del departamento
    expect(responseUpdate.body).toStrictEqual(deptoCopiaVerificar); //verificamos con la copia para verificar

    //verificar que un objeto obtenido de la api conicide con el agregado y luego modificado
    const responseGET = await request(app).get("/api/v1/departamentos/d999");
    expect(responseGET).toBeDefined();
    expect(responseGET.statusCode).toBe(200);
    expect(responseGET.body).toStrictEqual(deptoCopiaVerificar); //verificamos con la copia para verificar

    // luego eliminar
    const responseDelete = await request(app)
      .delete("/api/v1/departamentos/d999")
      .send();
    expect(responseDelete).toBeDefined();
    expect(responseDelete.statusCode).toBe(204);
  });
});


/*--------------------------------------------*/


it("Verificar que modifica con PUT /api/v1/departamentos/d002/manager", async () => {
  const manNuevo = { emp_no: 100001 };

  // Verificamos que el empleado exista
  const resEmp = await request(app).get("/api/v1/empleados/100001/");
  expect(resEmp).toBeDefined();
  expect(resEmp.statusCode).toBe(200);
  const empleado = resEmp.body;
  expect(empleado).toBeDefined();
  expect(empleado.emp_no).toBeDefined();
  expect(empleado.emp_no).toBe(100001);

  // Verificamos que el departamento destino exista
  const resDep = await request(app).get("/api/v1/departamentos/d002");
  expect(resDep).toBeDefined();
  expect(resDep.statusCode).toBe(200);
  const depar = resDep.body;
  expect(depar).toBeDefined();
  expect(depar.dept_no).toBeDefined();
  expect(depar.dept_no).toBe("d002");
  expect(depar.dept_name).toBeDefined();
  expect(depar.dept_name).toBe("Finance");

  // Verificamos que el departamento destino sea distinto al departamento actual
  const resManAct = await request(app).get("/api/v1/departamentos/d002/manager/last");
  expect(resManAct).toBeDefined();
  expect(resManAct.statusCode).toBe(200);
  const manAct = resManAct.body;
  expect(manAct).toBeDefined();
  expect(manAct.emp_no).toBeDefined();
  expect(manAct.emp_no).not.toBe(manNuevo.emp_no);

  //Ahora modificamos con PUT
  const responseUpdate = await request(app)
    .put("/api/v1/departamentos/d002/manager")
    .send(manNuevo); //enviamos la copia
  expect(responseUpdate).toBeDefined();
  expect(responseUpdate.statusCode).toBe(201);
  expect(responseUpdate.body.emp_no).toStrictEqual(manNuevo.emp_no); //verificamos con la copia para verificar

  const registro = await request(app).get("/api/v1/departamentos/d002/manager/all");
  const antMan = registro.body[registro.body.length-2];
  const ultMan = registro.body[registro.body.length-1];
  const today = new Date().setHours(0, 0, 0, 0);
  expect(Date.parse(antMan.to_date)).toBe(today);
  expect(Date.parse(ultMan.from_date)).toBe(today);
  expect(ultMan.to_date).toBe("9999-01-01T03:00:00.000Z");
  expect(ultMan.emp_no).toBe(manNuevo.emp_no);
  
});

/*--------------------------------------------*/
