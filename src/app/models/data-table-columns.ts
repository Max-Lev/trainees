import { Trainee } from "./trainee.model";

export const DATA_COLUMNS:{ columnDef: string; header: string; cell: (element: Trainee) => string; }[] = [
    {
      columnDef: 'id',
      header: 'ID.',
      cell: (element: Trainee) => `${element.id}`,
    },
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: Trainee) => `${element.name}`,
    },
    {
      columnDef: 'date',
      header: 'Date',
      cell: (element: Trainee) => `${element.date}`,
    },
    {
      columnDef: 'grade',
      header: 'Grade',
      cell: (element: Trainee) => `${element.grade}`,
    },
    {
      columnDef: 'subject',
      header: 'Subject',
      cell: (element: Trainee) => `${element.subject}`,
    }
  ];
export const MONITOR_COLUMNS:{ columnDef: string; header: string; cell: (element: Trainee) => string; }[] = [
    {
      columnDef: 'id',
      header: 'ID.',
      cell: (element: Trainee) => `${element.id}`,
    },
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: Trainee) => `${element.name}`,
    },
    {
      columnDef: 'average',
      header: 'Average',
      cell: (element: Trainee) => `${element.average}`,
    },
    {
      columnDef: 'exams',
      header: 'Exams',
      cell: (element: Trainee) => `${element.exams}`,
    }
  ];