import { effect, inject, Injectable, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { TraineeService } from '../../providers/trainee.service';
import { AnalysisStateService } from '../../features/analysis-page/analysis-state.service';

@Injectable({
  providedIn: 'root'
})
export class DataTableContainer {
  // Inject the TraineeService
  traineeService = inject(TraineeService);

  // Core data state
  // trainees = signal<Trainee[]>([]);
  trainees = this.traineeService.trainees;

  isAddBtnDisabled = signal<boolean>(false);

  // UI state
  selectedTrainee = signal<{ action: string, payload: Trainee | null }>({
    action: SELECT_ACTIONS.initial,
    payload: null
  });

  // Filter and pagination state - persistent across navigation
  filterValue = signal<string>('');
  pageState = signal<{ pageIndex: number, pageSize: number }>({ pageIndex: 0, pageSize: 10 });

  // Form values for add/update operations
  updatedTraineeValue = signal<Partial<Trainee> | null>(null);
  newTraineeValue = signal<Partial<Trainee> | null>(null);

  constructor() {
    effect(()=>{
      console.log('updatedTraineeValue ',this.updatedTraineeValue());
    })
  }


  // Utility function to toggle selection
  toggleSelection(value: { action: string; payload: Trainee | null; index?: number }) {
    const selected = this.selectedTrainee();

    // If clicking the same row, toggle selection off
    if (selected.payload?._index === value.payload?._index) {
      this.selectedTrainee.set({ action: SELECT_ACTIONS.initial, payload: null });
    } else {
      // Otherwise, select the trainee
      this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: value.payload });
    }
  }

  // Update an existing trainee
  updateTrainee(updated: Partial<Trainee>) {
    
    if (!updated || !this.selectedTrainee().payload) return;

    updated = {
      ...updated,
      grade: (updated.grades && updated.subject ? updated.grades[updated.subject] : undefined),
    } as Trainee; // Ensure value is of type Trainee
    
    
    const selectedTrainee = this.selectedTrainee().payload;
    const updatedTrainee = { ...selectedTrainee, ...updated };
    
    // Update the trainee in the TraineeService
    this.traineeService.updateTrainee(updatedTrainee as Trainee);
    // Update the selected trainee in the UI
    this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: updatedTrainee as Trainee });
    // Reset the updatedTraineeValue
    this.updatedTraineeValue.set(null);
  }

  // Add a new trainee
  addNewTrainee() {
    
    const newTrainee = this.newTraineeValue();
    console.log('newTrainee ', newTrainee);
    if (!newTrainee) return;

    // Generate a unique ID (in a real app this might come from the backend)
    const maxId = Math.max(...this.trainees().map(t => t.id || 0), 0);
    const traineeWithId: Partial<Trainee> = {
      ...newTrainee,
      id: (!newTrainee.id) ? (maxId + 1) : newTrainee.id,
      dateJoined: newTrainee.dateJoined || new Date().toISOString().slice(0, 10),
      _index: this.trainees().length
    };
    console.log('default date ', new Date().toISOString().split('T')[0]);
    console.log('traineeWithId ', traineeWithId);
    // Add the new trainee to the TraineeService
    this.traineeService.addTrainee(traineeWithId);

    // Select the newly added trainee
    this.selectedTrainee.set({
      action: SELECT_ACTIONS.select_row,
      payload: traineeWithId as Trainee
    });

    // Reset the newTraineeValue
    this.newTraineeValue.set(null);
  }

  // Remove a trainee
  removeTrainee(trainee: Trainee | null = null) {
    const traineeToRemove = trainee || this.selectedTrainee().payload;
    if (!traineeToRemove || !traineeToRemove.id) return;

    // Remove the trainee from the TraineeService
    this.traineeService.removeTrainee(traineeToRemove);
    // Reset the selected trainee
    this.selectedTrainee.set({ action: SELECT_ACTIONS.initial, payload: null });
  }

  // Open the panel for adding a new trainee
  openAddPanel() {
    this.selectedTrainee.set({ action: SELECT_ACTIONS.open_panel, payload: null });
    this.newTraineeValue.set({});
  }

  // Update filter state
  setFilter(value: string) {
    this.filterValue.set(value);
  }

  // Update pagination state
  setPageState(state: { pageIndex: number, pageSize: number }) {
    this.pageState.set(state);
  }
}

/**
 *  {
    "id": 4,
    "name": "Mike Johnson",
    "subject": "Mathematics",
    "grade": 91,
    "date": "2023-01-15",
    "email": "mike@example.com",
    "dateJoined": "2022-08-15",
    "address": "789 Elm St",
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "zip": "60007",
    "age": 27,
    "phone": "312-555-7890",
    "grades": {
      "Mathematics": 33,
      "Physics": 67,
      "Chemistry": 36,
      "Biology": 75,
      "Algebra": 100,
      "Geometry": 100,
      "Trigonometry": 57,
      "Statistics": 90,
      "Calculus": 94,
      "Economics": 79,
      "Computer Science": 91,
      "History": 92,
      "English Literature": 84,
      "Art History": 4,
      "Psychology": 85
    }
  },
  {
    "id": 5,
    "name": "Jane Doe",
    "subject": "Biology",
    "grade": 58,
    "date": "2023-01-25",
    "email": "jane@example.com",
    "dateJoined": "2022-09-05",
    "address": "456 Park Ave",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zip": "10001",
    "age": 29,
    "phone": "212-555-3456",
    "grades": {
      "Mathematics": 34,
      "Physics": 27,
      "Chemistry": 36,
      "Biology": 80,
      "Algebra": 97,
      "Geometry": 33,
      "Trigonometry": 90,
      "Statistics": 43,
      "Calculus": 38,
      "Economics": 47,
      "Computer Science": 47,
      "History": 78,
      "English Literature": 24,
      "Art History": 91,
      "Psychology": 50
    }
  },
  {
    "id": 6,
    "name": "Sara Williams",
    "subject": "Physics",
    "grade": 77,
    "date": "2023-01-20",
    "email": "sara@example.com",
    "dateJoined": "2022-09-10",
    "address": "101 Pine St",
    "city": "Seattle",
    "state": "WA",
    "country": "USA",
    "zip": "98101",
    "age": 26,
    "phone": "206-555-8765",
    "grades": {
      "Mathematics": 100,
      "Physics": 57,
      "Chemistry": 98,
      "Biology": 92,
      "Algebra": 56,
      "Geometry": 51,
      "Trigonometry": 62,
      "Statistics": 80,
      "Calculus": 78,
      "Economics": 62,
      "Computer Science": 83,
      "History": 58,
      "English Literature": 57,
      "Art History": 100,
      "Psychology": 61
    }
  },
  {
    "id": 7,
    "name": "Mike Johnson",
    "subject": "Chemistry",
    "grade": 83,
    "date": "2023-01-22",
    "email": "mike@example.com",
    "dateJoined": "2022-08-15",
    "address": "789 Elm St",
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "zip": "60007",
    "age": 33,
    "phone": "312-555-9012",
    "grades": {
      "Mathematics": 24,
      "Physics": 6,
      "Chemistry": 100,
      "Biology": 94,
      "Algebra": 5,
      "Geometry": 10,
      "Trigonometry": 21,
      "Statistics": 91,
      "Calculus": 76,
      "Economics": 19,
      "Computer Science": 16,
      "History": 1,
      "English Literature": 50,
      "Art History": 34,
      "Psychology": 25
    }
  },
  {
    "id": 8,
    "name": "David Brown",
    "subject": "Mathematics",
    "grade": 66,
    "date": "2023-01-15",
    "email": "david@example.com",
    "dateJoined": "2022-09-20",
    "address": "202 Oak St",
    "city": "Austin",
    "state": "TX",
    "country": "USA",
    "zip": "78701",
    "age": 25,
    "phone": "512-555-2345",
    "grades": {
      "Mathematics": 71,
      "Physics": 100,
      "Chemistry": 78,
      "Biology": 90,
      "Algebra": 70,
      "Geometry": 84,
      "Trigonometry": 100,
      "Statistics": 94,
      "Calculus": 76,
      "Economics": 100,
      "Computer Science": 100,
      "History": 100,
      "English Literature": 91,
      "Art History": 90,
      "Psychology": 90
    }
  },
  {
    "id": 9,
    "name": "John Smith",
    "subject": "Biology",
    "grade": 79,
    "date": "2023-01-25",
    "email": "john@example.com",
    "dateJoined": "2022-09-01",
    "address": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "country": "USA",
    "zip": "02108",
    "age": 30,
    "phone": "617-555-4567",
    "grades": {
      "Mathematics": 61,
      "Physics": 72,
      "Chemistry": 51,
      "Biology": 13,
      "Algebra": 72,
      "Geometry": 84,
      "Trigonometry": 94,
      "Statistics": 74,
      "Calculus": 52,
      "Economics": 44,
      "Computer Science": 9,
      "History": 69,
      "English Literature": 50,
      "Art History": 99,
      "Psychology": 28
    }
  },
  {
    "id": 10,
    "name": "Sara Williams",
    "subject": "Chemistry",
    "grade": 82,
    "date": "2023-01-22",
    "email": "sara@example.com",
    "dateJoined": "2022-09-10",
    "address": "101 Pine St",
    "city": "Seattle",
    "state": "WA",
    "country": "USA",
    "zip": "98101",
    "age": 21,
    "phone": "206-555-1234",
    "grades": {
      "Mathematics": 16,
      "Physics": 27,
      "Chemistry": 20,
      "Biology": 15,
      "Algebra": 32,
      "Geometry": 37,
      "Trigonometry": 13,
      "Statistics": 89,
      "Calculus": 7,
      "Economics": 19,
      "Computer Science": 82,
      "History": 6,
      "English Literature": 58,
      "Art History": 30,
      "Psychology": 26
    }
  },
  {
    "id": 11,
    "name": "Emily Davis",
    "subject": "Mathematics",
    "grade": 93,
    "date": "2023-01-15",
    "email": "emily@example.com",
    "dateJoined": "2022-10-01",
    "address": "303 Maple St",
    "city": "Denver",
    "state": "CO",
    "country": "USA",
    "zip": "80202",
    "age": 22,
    "phone": "303-555-8901",
    "grades": {
      "Mathematics": 89,
      "Physics": 80,
      "Chemistry": 100,
      "Biology": 100,
      "Algebra": 23,
      "Geometry": 73,
      "Trigonometry": 98,
      "Statistics": 50,
      "Calculus": 100,
      "Economics": 87,
      "Computer Science": 90,
      "History": 94,
      "English Literature": 90,
      "Art History": 70,
      "Psychology": 86
    }
  },
  {
    "id": 12,
    "name": "Jane Doe",
    "subject": "Mathematics",
    "grade": 60,
    "date": "2023-01-15",
    "email": "jane@example.com",
    "dateJoined": "2022-09-05",
    "address": "456 Park Ave",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zip": "10001",
    "age": 34,
    "phone": "212-555-6789",
    "grades": {
      "Mathematics": 34,
      "Physics": 87,
      "Chemistry": 60,
      "Biology": 20,
      "Algebra": 19,
      "Geometry": 87,
      "Trigonometry": 16,
      "Statistics": 39,
      "Calculus": 22,
      "Economics": 48,
      "Computer Science": 71,
      "History": 33,
      "English Literature": 76,
      "Art History": 68,
      "Psychology": 50
    }
  },
  {
    "id": 13,
    "name": "David Brown",
    "subject": "Physics",
    "grade": 70,
    "date": "2023-01-20",
    "email": "david@example.com",
    "dateJoined": "2022-09-20",
    "address": "202 Oak St",
    "city": "Austin",
    "state": "TX",
    "country": "USA",
    "zip": "78701",
    "age": 36,
    "phone": "512-555-3456",
    "grades": {
      "Mathematics": 50,
      "Physics": 10,
      "Chemistry": 17,
      "Biology": 75,
      "Algebra": 52,
      "Geometry": 29,
      "Trigonometry": 15,
      "Statistics": 36,
      "Calculus": 18,
      "Economics": 15,
      "Computer Science": 6,
      "History": 73,
      "English Literature": 12,
      "Art History": 96,
      "Psychology": 15
    }
  },
  {
    "id": 14,
    "name": "Mike Johnson",
    "subject": "Biology",
    "grade": 89,
    "date": "2023-01-25",
    "email": "mike@example.com",
    "dateJoined": "2022-08-15",
    "address": "789 Elm St",
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "zip": "60007",
    "age": 38,
    "phone": "312-555-2345",
    "grades": {
      "Mathematics": 16,
      "Physics": 3,
      "Chemistry": 45,
      "Biology": 45,
      "Algebra": 23,
      "Geometry": 24,
      "Trigonometry": 3,
      "Statistics": 14,
      "Calculus": 86,
      "Economics": 33,
      "Computer Science": 29,
      "History": 88,
      "English Literature": 36,
      "Art History": 98,
      "Psychology": 45
    }
  },
  {
    "id": 15,
    "name": "Alex Wilson",
    "subject": "Chemistry",
    "grade": 55,
    "date": "2023-01-22",
    "email": "alex@example.com",
    "dateJoined": "2022-10-05",
    "address": "404 Cedar St",
    "city": "Portland",
    "state": "OR",
    "country": "USA",
    "zip": "97201",
    "age": 23,
    "phone": "503-555-7890",
    "grades": {
      "Mathematics": 12,
      "Physics": 50,
      "Chemistry": 23,
      "Biology": 76,
      "Algebra": 82,
      "Geometry": 51,
      "Trigonometry": 85,
      "Statistics": 52,
      "Calculus": 60,
      "Economics": 34,
      "Computer Science": 66,
      "History": 81,
      "English Literature": 39,
      "Art History": 23,
      "Psychology": 7
    }
  },
  {
    "id": 16,
    "name": "Emily Davis",
    "subject": "Physics",
    "grade": 88,
    "date": "2023-01-20",
    "email": "emily@example.com",
    "dateJoined": "2022-10-01",
    "address": "303 Maple St",
    "city": "Denver",
    "state": "CO",
    "country": "USA",
    "zip": "80202",
    "age": 24,
    "phone": "303-555-1234",
    "grades": {
      "Mathematics": 47,
      "Physics": 1,
      "Chemistry": 50,
      "Biology": 30,
      "Algebra": 36,
      "Geometry": 48,
      "Trigonometry": 31,
      "Statistics": 45,
      "Calculus": 4,
      "Economics": 17,
      "Computer Science": 68,
      "History": 60,
      "English Literature": 70,
      "Art History": 20,
      "Psychology": 97
    }
  },
  {
    "id": 17,
    "name": "Sara Williams",
    "subject": "Mathematics",
    "grade": 75,
    "date": "2023-01-15",
    "email": "sara@example.com",
    "dateJoined": "2022-09-10",
    "address": "101 Pine St",
    "city": "Seattle",
    "state": "WA",
    "country": "USA",
    "zip": "98101",
    "age": 28,
    "phone": "206-555-6543",
    "grades": {
      "Mathematics": 21,
      "Physics": 8,
      "Chemistry": 87,
      "Biology": 43,
      "Algebra": 25,
      "Geometry": 62,
      "Trigonometry": 19,
      "Statistics": 18,
      "Calculus": 37,
      "Economics": 59,
      "Computer Science": 59,
      "History": 35,
      "English Literature": 27,
      "Art History": 7,
      "Psychology": 92
    }
  },
  {
    "id": 18,
    "name": "Alex Wilson",
    "subject": "Biology",
    "grade": 62,
    "date": "2023-01-25",
    "email": "alex@example.com",
    "dateJoined": "2022-10-05",
    "address": "404 Cedar St",
    "city": "Portland",
    "state": "OR",
    "country": "USA",
    "zip": "97201",
    "age": 35,
    "phone": "503-555-4321",
    "grades": {
      "Mathematics": 49,
      "Physics": 63,
      "Chemistry": 94,
      "Biology": 69,
      "Algebra": 53,
      "Geometry": 3,
      "Trigonometry": 49,
      "Statistics": 59,
      "Calculus": 89,
      "Economics": 3,
      "Computer Science": 47,
      "History": 63,
      "English Literature": 13,
      "Art History": 100,
      "Psychology": 34
    }
  },
  {
    "id": 19,
    "name": "David Brown",
    "subject": "Chemistry",
    "grade": 69,
    "date": "2023-01-22",
    "email": "david@example.com",
    "dateJoined": "2022-09-20",
    "address": "202 Oak St",
    "city": "Austin",
    "state": "TX",
    "country": "USA",
    "zip": "78701",
    "age": 30,
    "phone": "512-555-9876",
    "grades": {
      "Mathematics": 1,
      "Physics": 40,
      "Chemistry": 60,
      "Biology": 21,
      "Algebra": 2,
      "Geometry": 31,
      "Trigonometry": 36,
      "Statistics": 98,
      "Calculus": 49,
      "Economics": 64,
      "Computer Science": 6,
      "History": 64,
      "English Literature": 91,
      "Art History": 32,
      "Psychology": 81
    }
  },
  {
    "id": 20,
    "name": "Morgan Freeman",
    "subject": "Algebra",
    "grade": 98,
    "date": "2023-01-15",
    "email": "morgan@example.com",
    "dateJoined": "2022-10-10",
    "address": "505 Birch St",
    "city": "Miami",
    "state": "FL",
    "country": "USA",
    "zip": "33101",
    "age": 40,
    "phone": "305-555-8765",
    "grades": {
      "Mathematics": 100,
      "Physics": 75,
      "Chemistry": 81,
      "Biology": 100,
      "Algebra": 82,
      "Geometry": 86,
      "Trigonometry": 58,
      "Statistics": 52,
      "Calculus": 95,
      "Economics": 44,
      "Computer Science": 100,
      "History": 79,
      "English Literature": 100,
      "Art History": 100,
      "Psychology": 53
    }
  },
  {
    "id": 21,
    "name": "Liam Carter",
    "subject": "Geometry",
    "grade": 81,
    "date": "2023-01-18",
    "email": "liam@example.com",
    "dateJoined": "2022-11-01",
    "address": "606 Spruce St",
    "city": "San Diego",
    "state": "CA",
    "country": "USA",
    "zip": "92101",
    "age": 27,
    "phone": "619-555-3456",
    "grades": {
      "Mathematics": 21,
      "Physics": 0,
      "Chemistry": 30,
      "Biology": 95,
      "Algebra": 82,
      "Geometry": 60,
      "Trigonometry": 65,
      "Statistics": 37,
      "Calculus": 33,
      "Economics": 76,
      "Computer Science": 33,
      "History": 8,
      "English Literature": 97,
      "Art History": 67,
      "Psychology": 43
    }
  },
  {
    "id": 22,
    "name": "Olivia Green",
    "subject": "Trigonometry",
    "grade": 76,
    "date": "2023-01-19",
    "email": "olivia@example.com",
    "dateJoined": "2022-10-15",
    "address": "707 Fir St",
    "city": "Phoenix",
    "state": "AZ",
    "country": "USA",
    "zip": "85001",
    "age": 21,
    "phone": "602-555-7890",
    "grades": {
      "Mathematics": 28,
      "Physics": 88,
      "Chemistry": 54,
      "Biology": 44,
      "Algebra": 4,
      "Geometry": 37,
      "Trigonometry": 81,
      "Statistics": 85,
      "Calculus": 16,
      "Economics": 81,
      "Computer Science": 72,
      "History": 81,
      "English Literature": 68,
      "Art History": 52,
      "Psychology": 84
    }
  },
  {
    "id": 23,
    "name": "Ethan Lee",
    "subject": "Statistics",
    "grade": 84,
    "date": "2023-01-20",
    "email": "ethan@example.com",
    "dateJoined": "2022-09-25",
    "address": "808 Walnut St",
    "city": "Philadelphia",
    "state": "PA",
    "country": "USA",
    "zip": "19107",
    "age": 29,
    "phone": "215-555-2109",
    "grades": {
      "Mathematics": 38,
      "Physics": 21,
      "Chemistry": 20,
      "Biology": 94,
      "Algebra": 95,
      "Geometry": 43,
      "Trigonometry": 13,
      "Statistics": 37,
      "Calculus": 14,
      "Economics": 25,
      "Computer Science": 47,
      "History": 45,
      "English Literature": 24,
      "Art History": 36,
      "Psychology": 2
    }
  },
  {
    "id": 24,
    "name": "Sophia Hall",
    "subject": "Calculus",
    "grade": 90,
    "date": "2023-01-21",
    "email": "sophia@example.com",
    "dateJoined": "2022-08-30",
    "address": "909 Cherry St",
    "city": "Dallas",
    "state": "TX",
    "country": "USA",
    "zip": "75201",
    "age": 26,
    "phone": "214-555-6543",
    "grades": {
      "Mathematics": 44,
      "Physics": 44,
      "Chemistry": 81,
      "Biology": 7,
      "Algebra": 55,
      "Geometry": 91,
      "Trigonometry": 52,
      "Statistics": 94,
      "Calculus": 57,
      "Economics": 93,
      "Computer Science": 44,
      "History": 23,
      "English Literature": 16,
      "Art History": 48,
      "Psychology": 75
    }
  },
  {
    "id": 25,
    "name": "Noah Scott",
    "subject": "Economics",
    "grade": 73,
    "date": "2023-01-22",
    "email": "noah@example.com",
    "dateJoined": "2022-09-10",
    "address": "1010 Palm St",
    "city": "San Jose",
    "state": "CA",
    "country": "USA",
    "zip": "95112",
    "age": 33,
    "phone": "408-555-7890",
    "grades": {
      "Mathematics": 8,
      "Physics": 98,
      "Chemistry": 91,
      "Biology": 20,
      "Algebra": 44,
      "Geometry": 1,
      "Trigonometry": 0,
      "Statistics": 65,
      "Calculus": 7,
      "Economics": 37,
      "Computer Science": 77,
      "History": 42,
      "English Literature": 81,
      "Art History": 68,
      "Psychology": 22
    }
  }
 */