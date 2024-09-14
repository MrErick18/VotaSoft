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
        searchText = searchText.toLowerCase();
        return usuarios.filter(usuario =>
            usuario.nombre.toLowerCase().includes(searchText) ||
            usuario.apellidos.toLowerCase().includes(searchText) ||
            usuario.tipoDoc.toLowerCase().includes(searchText) ||
            usuario.numDoc.includes(searchText)
        );
    }
}
