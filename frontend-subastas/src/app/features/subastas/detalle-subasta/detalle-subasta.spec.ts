import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleSubasta } from './detalle-subasta';

describe('DetalleSubasta', () => {
  let component: DetalleSubasta;
  let fixture: ComponentFixture<DetalleSubasta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleSubasta],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleSubasta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
