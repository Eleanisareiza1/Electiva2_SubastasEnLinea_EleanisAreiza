import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoSubastas } from './listado-subastas';

describe('ListadoSubastas', () => {
  let component: ListadoSubastas;
  let fixture: ComponentFixture<ListadoSubastas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoSubastas],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoSubastas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
