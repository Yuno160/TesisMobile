import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { pacientesService } from '../services/pacientes';
import { Subscription } from 'rxjs';

import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
  IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, 
  IonButton, IonIcon, ToastController, LoadingController 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-crear-paciente',
  templateUrl: './crear-paciente.page.html',
  styleUrls: ['./crear-paciente.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
    IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, 
    IonButton, IonIcon
  ]
})
export class CrearPacientePage implements OnInit {

  
  pacienteForm: FormGroup;
  esEdicion = false;
  idPacienteEditar: number | null = null;
  carnetOriginal: string = '';
  
  // Para manejar la suscripción y evitar fugas de memoria
  private routeSub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private pacientesService: pacientesService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ saveOutline });

    this.pacienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      carnet_identidad: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]],
      telefono: [''],
      direccion: [''],
      genero: ['Masculino'],
      antecedentes_medicos: ['']
    });
  }

  ngOnInit() {
    console.log('🔄 Inicializando página (ngOnInit)...');
    
    // --- SOLUCIÓN: SUSCRIPCIÓN REACTIVA ---
    // Esto detecta cambios en la URL incluso si la página ya estaba creada
    this.routeSub = this.route.paramMap.subscribe(params => {
      const idParam = params.get('carnet_identidad');
      console.log('📡 URL cambió. Nuevo ID detectado:', params);
      
      // Reseteamos el formulario siempre que cambie la URL
      this.resetearFormulario();

      if (idParam) {
        this.esEdicion = true;
        this.idPacienteEditar = Number(idParam);
        this.cargarDatosPaciente(this.idPacienteEditar);
      } else {
        this.esEdicion = false;
        this.idPacienteEditar = null;
        console.log('✨ Modo Creación activado');
      }
    });
  }

  ngOnDestroy() {
    // Limpiamos la suscripción al salir
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  resetearFormulario() {
    this.pacienteForm.reset({ genero: 'Masculino' });
    this.carnetOriginal = '';
  }

  async cargarDatosPaciente(id: number) {
    const loading = await this.loadingController.create({ message: 'Cargando datos...' });
    await loading.present();

    this.pacientesService.getPacienteById(id).subscribe({
      next: (respuesta: any) => {
        loading.dismiss();
        
        let data = respuesta;
        // Manejo flexible de la respuesta del backend
        if (Array.isArray(respuesta)) {
            data = respuesta.length > 0 ? respuesta[0] : null;
        } else if (respuesta && respuesta.data) {
            data = respuesta.data;
        }

        console.log('📝 Datos cargados:', data);

        if (data) {
          this.pacienteForm.patchValue({
            nombre: data.nombre,
            carnet_identidad: data.carnet_identidad,
            telefono: data.telefono,
            direccion: data.direccion,
            edad: data.edad,
            genero: data.genero,
            antecedentes_medicos: data.antecedentes_medicos
          });
          this.carnetOriginal = data.carnet_identidad;
        } else {
            this.mostrarToast('No se encontraron datos para este paciente');
        }
      },
      error: (err) => {
        loading.dismiss();
        console.error('❌ Error al cargar:', err);
        this.mostrarToast('Error al cargar datos');
      }
    });
  }

  async guardar() {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched(); 
      return;
    }

    const loading = await this.loadingController.create({ message: 'Guardando...' });
    await loading.present();

    const formValues = this.pacienteForm.value;
    
    // Validación de género
    let generoValido = formValues.genero;
    const permitidos = ['Masculino', 'Femenino', 'Otro'];
    if (!permitidos.includes(generoValido)) generoValido = 'Masculino';

    // Limpieza de datos
    const datosLimpios = {
      nombre: formValues.nombre,
      carnet_identidad: formValues.carnet_identidad,
      edad: parseInt(formValues.edad, 10),
      telefono: (formValues.telefono && String(formValues.telefono).trim() !== '') ? formValues.telefono : null,
      direccion: (formValues.direccion && formValues.direccion.trim() !== '') ? formValues.direccion : null,
      genero: generoValido,
      antecedentes_medicos: (formValues.antecedentes_medicos && formValues.antecedentes_medicos.trim() !== '') ? formValues.antecedentes_medicos : null
    } as any; 

    if (this.esEdicion && this.carnetOriginal) {
      this.pacientesService.actualizarPaciente(this.carnetOriginal, datosLimpios).subscribe({
        next: () => {
          loading.dismiss();
          this.mostrarToast('Paciente actualizado correctamente');
          this.router.navigate(['/pacientes']);
        },
        error: (err) => {
          loading.dismiss();
          console.error('❌ Error actualización:', err);
          const msg = err.error?.message || 'Error al actualizar';
          this.mostrarToast(msg);
        }
      });
    } else {
      this.pacientesService.crearPaciente(datosLimpios).subscribe({
        next: () => {
          loading.dismiss();
          this.mostrarToast('Paciente registrado correctamente');
          this.router.navigate(['/pacientes']);
        },
        error: (err) => {
          loading.dismiss();
          console.error('❌ Error creación:', err);
          let msg = 'Error al registrar';
          if (err.error?.message) msg += ': ' + err.error.message;
          this.mostrarToast(msg);
        }
      });
    }
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}