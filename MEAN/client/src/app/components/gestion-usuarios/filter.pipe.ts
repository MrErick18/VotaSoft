import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    standalone: true
})
export class FilterPipe implements PipeTransform {
    transform(usuarios: any[], searchText: string): any[] {
        if (!usuarios || !searchText) {
            return usuarios;
        }
        return usuarios.filter(usuario =>
            usuario.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
            usuario.apellidos.toLowerCase().includes(searchText.toLowerCase()) || // Agrega búsqueda por apellidos
            usuario.numDoc.includes(searchText) // Agrega búsqueda por número de documento
        );
    }
}
