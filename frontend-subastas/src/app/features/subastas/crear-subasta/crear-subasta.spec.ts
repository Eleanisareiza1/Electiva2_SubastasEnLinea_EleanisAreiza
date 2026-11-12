import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearSubasta } from './crear-subasta';

describe('CrearSubasta', () => {
  let component: CrearSubasta;
  let fixture: ComponentFixture<CrearSubasta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSubasta],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearSubasta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
