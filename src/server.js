import express from "express";
import { buildSchema } from "graphql";
import { PrismaClient } from "@prisma/client";
import { graphqlHTTP } from "express-graphql";

const app = express();
const prisma = new PrismaClient();

let schema = buildSchema(`

type Class {
  class_id: Int!
  class_name: String!
  class_level: Int!
  school_year: String!
  students: [Student!]!
  courses: [Course!]!
}

type Student {
  student_id: Int!
  first_name: String!
  last_name: String!
  date_of_birth: String!
  gender: String!
  address: String!
  class: Class!
  grades: [Grade!]!
  created_at: String!
}

type Grade {
  grade_id: Int!
  value: Float!
  date: String!
  student: Student!
  course: Course!
}

type Teacher {
  teacher_id: Int!
  first_name: String!
  last_name: String!
  email_address: String!
  password: String!
  courses: [Course!]!
  created_at: String!
}

type Program {
  program_id: Int!
  program_name: String!
  program_description: String!
  subjects: [Subject!]!
}

type Subject {
  subject_id: Int!
  subject_name: String!
  subject_description: String!
  program: Program!
  courses: [Course!]!
}

type Course {
  course_id: Int!
  date: String!
  start_time: String!
  end_time: String!
  teacher: Teacher!
  subject: Subject!
  class: Class!
  grades: [Grade!]!
}


type Query {
  getAllClass: [Class]
  getClassById(classId: Int!): Class
  getClassByStudentName(studentName: String!): Class
  
  getAllStudents: [Student]
  getStudentByLastName(lastName: String!): [Student!]!
  getStudentByClass(classId: Int!): [Student!]!
  getStudentById(studentId: Int!): Student!

  getGradeById(grade_id: Int!): Grade
  getGradeByStudentId(student_id: Int!): [Grade]
  getGradeByCourseId(course_id: Int!): [Grade]

  getTeacherById(teacherId: Int!): Teacher
  getTeacherByLastName(last_name: String!): [Teacher!]!
  getTeacherByEmail(emailAddress: String!): Teacher
  getAllTeachers: [Teacher!]!

  getProgramById(program_id: Int!): Program
  getProgramByName(program_name: String!): Program
  getProgramBySubject(subject_id: Int!): [Program!]!

  getSubjectById(id: Int!): Subject
  getSubjectByName(name: String!): Subject
  getSubjectsByProgram(programId: Int!): [Subject!]!

  getCourseById(course_id: Int!): Course
  getCoursesByTeacherId(teacher_id: Int!): [Course]
  getCoursesBySubjectId(subject_id: Int!): [Course]
  getCoursesByClassId(class_id: Int!): [Course]
}

type Mutation {
  createClass(
    class_name: String!
    class_level: Int!
    school_year: String!
  ): Class!

  updateClass(
    classId: Int!
    className: String
    classLevel: Int
    schoolYear: String
  ): Class!

  deleteClass(classId: Int!): Boolean


  createStudent(
    first_name: String!
    last_name: String!
    date_of_birth: String!
    gender: String!
    address: String!
    class_id: Int!
  ): Student!

  updateStudent(
    student_id: Int!
    first_name: String
    last_name: String
    date_of_birth: String
    gender: String
    address: String
    class_id: Int
  ): Student!

  deleteStudent(student_id: Int!): Boolean!


  createTeacher(
    first_name: String!
    last_name: String!
    email_address: String!
    password: String!
  ): Teacher!
  
  updateTeacher(
    teacher_id: Int!
    first_name: String
    last_name: String
    email_address: String
    password: String
  ): Teacher!
  
  deleteTeacher(teacher_id: Int!): Teacher!


  createSubject(
    subjectName: String!
    subjectDescription: String!
    programId: Int!
  ): Subject!

  updateSubject(
    subjectId: Int!
    subjectName: String
    subjectDescription: String
    programId: Int
  ): Subject!

  deleteSubject(subjectId: Int!): Subject!

  createCourse(
    date: String!,
    start_time: String!,
    end_time: String!,
    teacher_id: Int!,
    subject_id: Int!,
    class_id: Int!): Course
  updateCourse(
    course_id: Int!,
    date: String,
    start_time: String,
    end_time: String,
    teacher_id: Int,
    subject_id: Int,
    class_id: Int): Course
  deleteCourse(course_id: Int!): Course

}
`);

let root = {
  /* Class */
  getAllClass: async () => {
    return await prisma.class.findMany();
  },
  getClassById: async (args) => {
    const classById = await prisma.class.findUnique({
      where: { class_id: Number(args.classId) },
      include: { students: true, courses: true },
    });
    return classById;
  },
  getClassByStudentName: async (args) => {
    const { studentName } = args;
    const classes = await prisma.class.findMany({
      where: {
        students: {
          some: {
            OR: [
              { first_name: { contains: studentName } },
              { last_name: { contains: studentName } },
            ],
          },
        },
      },
      include: {
        students: true,
        courses: true,
      },
    });
    return classes;
  },
  createClass: async (args) => {
    const { className, classLevel, schoolYear } = args;
    return await prisma.class.create({
      data: {
        class_name: className,
        class_level: classLevel,
        school_year: schoolYear,
      },
    });
  },

  updateClass: async (args) => {
    const { classId, className, classLevel, schoolYear } = args;
    return await prisma.class.update({
      where: { class_id: classId },
      data: {
        class_name: className,
        class_level: classLevel,
        school_year: schoolYear,
      },
    });
  },

  deleteClass: async (args) => {
    const { classId } = args;
    return await prisma.class.delete({
      where: { class_id: classId },
    });
  },

  /* Student */
  getStudentByLastName: async ({ lastName }) => {
    const students = await prisma.student.findMany({
      where: {
        last_name: lastName,
      },
      include: {
        class: true,
        grades: true,
      },
    });
    return students;
  },
  getStudentByClass: async ({ classId }) => {
    const students = await prisma.student.findMany({
      where: {
        class_id: classId,
      },
      include: {
        class: true,
        grades: true,
      },
    });
    return students;
  },
  getStudentById: async ({ studentId }) => {
    const student = await prisma.student.findUnique({
      where: {
        student_id: studentId,
      },
      include: {
        class: true,
        grades: true,
      },
    });
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }
    return student;
  },
  getAllStudents: async () => {
    const students = await prisma.student.findMany();
    return students;
  },

  createStudent: async (args) => {
    try {
      const newStudent = await context.prisma.student.create({
        data: {
          first_name: args.first_name,
          last_name: args.last_name,
          email_address: args.email_address,
          password: args.password,
          class: {
            connect: { class_id: args.class_id },
          },
        },
      });
      return newStudent;
    } catch (error) {
      throw new Error(`Could not create student: ${error.message}`);
    }
  },
  updateStudent: async (args) => {
    try {
      const updatedStudent = await context.prisma.student.update({
        where: {
          student_id: parseInt(args.student_id),
        },
        data: {
          first_name: args.first_name,
          last_name: args.last_name,
          email_address: args.email_address,
          password: args.password,
          class: {
            connect: { class_id: args.class_id },
          },
        },
      });
      return updatedStudent;
    } catch (error) {
      throw new Error(`Could not update student: ${error.message}`);
    }
  },
  deleteStudent: async (args) => {
    try {
      const deletedStudent = await context.prisma.student.delete({
        where: {
          student_id: parseInt(args.student_id),
        },
      });
      return deletedStudent;
    } catch (error) {
      throw new Error(`Could not delete student: ${error.message}`);
    }
  },

  /* Grade */
  getGradeById: async ({ grade_id }) => {
    return await prisma.grade.findUnique({ where: { grade_id } });
  },
  getGradeByStudentId: async ({ student_id }) => {
    return await prisma.grade.findMany({ where: { student_id } });
  },
  getGradeByCourseId: async ({ course_id }) => {
    return await prisma.grade.findMany({ where: { course_id } });
  },

  createGrade: async (_, { value, date, studentId, courseId }) => {
    return await prisma.grade.create({
      data: {
        value,
        date,
        student: { connect: { student_id: studentId } },
        course: { connect: { course_id: courseId } },
      },
    });
  },

  updateGrade: async (_, { gradeId, value, date, studentId, courseId }) => {
    const grade = await prisma.grade.findUnique({
      where: { grade_id: gradeId },
    });
    if (!grade) throw new Error(`Grade not found for id: ${gradeId}`);
    return await prisma.grade.update({
      where: { grade_id: gradeId },
      data: {
        value: value !== undefined ? value : grade.value,
        date: date !== undefined ? date : grade.date,
        student_id: studentId !== undefined ? studentId : grade.student_id,
        course_id: courseId !== undefined ? courseId : grade.course_id,
      },
    });
  },

  deleteGrade: async (_, { gradeId }) => {
    return await prisma.grade.delete({ where: { grade_id: gradeId } });
  },
  /* Teacher */

  getTeacherById: async ({ teacherId }, { prisma }) => {
    return await prisma.teacher.findUnique({
      where: { teacher_id: teacherId },
    });
  },
  getTeacherByLastName: async (args) => {
    const { last_name } = args;
    return await prisma.teacher.findMany({
      where: {
        last_name,
      },
    });
  },
  getTeacherByEmail: async ({ emailAddress }, { prisma }) => {
    return await prisma.teacher.findUnique({
      where: { email_address: emailAddress },
    });
  },
  getAllTeachers: async ({ prisma }) => {
    return await prisma.teacher.findMany();
  },

  createTeacher: async (args) => {
    const { first_name, last_name, email_address, password } = args;
    return await prisma.teacher.create({
      data: {
        first_name,
        last_name,
        email_address,
        password,
      },
    });
  },
  updateTeacher: async (args) => {
    const { teacher_id, first_name, last_name, email_address, password } = args;
    return await prisma.teacher.update({
      where: {
        teacher_id,
      },
      data: {
        first_name,
        last_name,
        email_address,
        password,
      },
    });
  },
  deleteTeacher: async (args) => {
    const { teacher_id } = args;
    return await prisma.teacher.delete({
      where: {
        teacher_id,
      },
    });
  },

  /* Program */
  getProgramById: async ({ program_id }) => {
    return await prisma.program.findUnique({ where: { program_id } });
  },
  getProgramByName: async ({ program_name }) => {
    return await prisma.program.findUnique({ where: { program_name } });
  },
  getProgramBySubject: async ({ subject_id }) => {
    return await prisma.program.findMany({
      where: { subjects: { some: { subject_id } } },
    });
  },

  createProgram: async ({ program_name, program_description }) => {
    return await prisma.program.create({
      data: {
        program_name,
        program_description,
      },
    });
  },
  updateProgram: async ({ program_id, program_name, program_description }) => {
    return await prisma.program.update({
      where: {
        program_id,
      },
      data: {
        program_name,
        program_description,
      },
    });
  },
  deleteProgram: async ({ program_id }) => {
    return await prisma.program.delete({
      where: {
        program_id,
      },
    });
  },
  /* Subject */
  getSubjectById: async (args) => {
    const { id } = args;
    return await prisma.subject.findUnique({
      where: { subject_id: id },
    });
  },
  getSubjectByName: async (args) => {
    const { name } = args;
    return await prisma.subject.findUnique({
      where: { subject_name: name },
    });
  },
  getSubjectsByProgram: async (args) => {
    const { programId } = args;
    return await prisma.subject.findMany({
      where: { program_id: programId },
    });
  },

  createSubject: async (args) => {
    const { subjectName, subjectDescription, programId } = args;
    return await prisma.subject.create({
      data: {
        subject_name: subjectName,
        subject_description: subjectDescription,
        program: { connect: { program_id: programId } },
      },
    });
  },

  // Modifier un sujet existant
  updateSubject: async (args) => {
    const { subjectId, subjectName, subjectDescription, programId } = args;
    return await prisma.subject.update({
      where: { subject_id: subjectId },
      data: {
        subject_name: subjectName,
        subject_description: subjectDescription,
        program: { connect: { program_id: programId } },
      },
    });
  },

  // Supprimer un sujet
  deleteSubject: async (args) => {
    const { subjectId } = args;
    return await prisma.subject.delete({
      where: { subject_id: subjectId },
    });
  },
  /* Course */
  getCourseById: async (args) => {
    const { course_id } = args;
    return await prisma.course.findUnique({
      where: { course_id },
    });
  },
  getCoursesByTeacherId: async (args) => {
    const { teacher_id } = args;
    return await prisma.course.findMany({
      where: { teacher_id },
    });
  },
  getCoursesBySubjectId: async (args) => {
    const { subject_id } = args;
    return await prisma.course.findMany({
      where: { subject_id },
    });
  },
  getCoursesByClassId: async (args) => {
    const { class_id } = args;
    return await prisma.course.findMany({
      where: { class_id },
    });
  },
  createCourse: async (args) => {
    const { date, start_time, end_time, teacher_id, subject_id, class_id } =
      args;
    return await prisma.course.create({
      data: {
        date: date,
        start_time: start_time,
        end_time: end_time,
        teacher_id: teacher_id,
        subject_id: subject_id,
        class_id: class_id,
      },
    });
  },
  updateCourse: async (args) => {
    const {
      course_id,
      date,
      start_time,
      end_time,
      teacher_id,
      subject_id,
      class_id,
    } = args;
    return await prisma.course.update({
      where: {
        course_id: course_id,
      },
      data: {
        date: date,
        start_time: start_time,
        end_time: end_time,
        teacher_id: teacher_id,
        subject_id: subject_id,
        class_id: class_id,
      },
    });
  },
  deleteCourse: async (args) => {
    const { course_id } = args;
    return await prisma.course.delete({
      where: {
        course_id: course_id,
      },
    });
  },
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("🚀 GraphQL Server up and ready to go at http://localhost:3000");
});
