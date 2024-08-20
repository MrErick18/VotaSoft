export class Administrador{
    _id?: number;
    nombre: string;
    apellido: string;
    tipoDoc: string;
    numDoc: string;
    correo: string
    contrasena: string;
    cargo: string;

    constructor(nombre: string, apellido: string, tipoDoc: string, numDoc: string, correo: string, contrasena: string, cargo: string){
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoDoc = tipoDoc;
        this.numDoc = numDoc;
        this.correo = correo;
        this.contrasena = contrasena;
        this.cargo = cargo;
    }
}