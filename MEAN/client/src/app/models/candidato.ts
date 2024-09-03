export class Candidato {
    _id?: string; // Este campo es opcional porque el ID es generado por MongoDB
    nombreCompleto: string;
    perfil: string;
    propuestas: string;
    foto: string;

    constructor(nombreCompleto: string, perfil: string, propuestas: string, foto: string) {
        this.nombreCompleto = nombreCompleto;
        this.perfil = perfil;
        this.propuestas = propuestas;
        this.foto = foto;
    }
}
