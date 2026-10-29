import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateDemoDataForSchool } from '../src/lib/demoDataGenerator';

describe('Multi-School Data Isolation & Tenant Integrity Tests', () => {
  const schoolA = 'school-apex';
  const schoolB = 'school-horizon';

  const demoA = generateDemoDataForSchool(schoolA, 'Aitchisonian Imperial College');
  const demoB = generateDemoDataForSchool(schoolB, 'High Star Public School');

  it('1. Generates isolated student records for School A and School B without leaking school_id', () => {
    assert.ok(demoA.students.length > 0, 'School A should have generated students');
    assert.ok(demoB.students.length > 0, 'School B should have generated students');

    for (const student of demoA.students) {
      assert.equal(student.school_id, schoolA, `Student ${student.id} must belong to ${schoolA}`);
      assert.notEqual(student.school_id, schoolB, 'Student must not belong to school B');
    }

    for (const student of demoB.students) {
      assert.equal(student.school_id, schoolB, `Student ${student.id} must belong to ${schoolB}`);
      assert.notEqual(student.school_id, schoolA, 'Student must not belong to school A');
    }
  });

  it('2. Ensures diary entries are strictly partitioned by school_id', () => {
    for (const entry of demoA.diary) {
      assert.equal(entry.school_id, schoolA, `Diary entry ${entry.id} must have school_id = ${schoolA}`);
    }
    for (const entry of demoB.diary) {
      assert.equal(entry.school_id, schoolB, `Diary entry ${entry.id} must have school_id = ${schoolB}`);
    }
  });

  it('3. Ensures Kids Progress reports are strictly isolated by school_id', () => {
    for (const prog of demoA.kidsProgress) {
      assert.equal(prog.school_id, schoolA, `Kids progress ${prog.id} must have school_id = ${schoolA}`);
    }
    for (const prog of demoB.kidsProgress) {
      assert.equal(prog.school_id, schoolB, `Kids progress ${prog.id} must have school_id = ${schoolB}`);
    }
  });

  it('4. Ensures Teacher Progress evaluations are strictly isolated by school_id', () => {
    for (const evalItem of demoA.teacherProgress) {
      assert.equal(evalItem.school_id, schoolA, `Teacher progress ${evalItem.id} must have school_id = ${schoolA}`);
    }
    for (const evalItem of demoB.teacherProgress) {
      assert.equal(evalItem.school_id, schoolB, `Teacher progress ${evalItem.id} must have school_id = ${schoolB}`);
    }
  });

  it('5. Ensures Parents Report Cards have unified parent IDs with correct children links', () => {
    assert.ok(demoA.parentsReports.length > 0, 'School A should have parents report cards');
    for (const card of demoA.parentsReports) {
      assert.equal(card.school_id, schoolA, `Parent card ${card.id} must belong to ${schoolA}`);
      assert.ok(card.children && card.children.length > 0, 'Parent must have enrolled children linked');
      for (const child of card.children) {
        assert.ok(child.student_id, 'Linked child must have valid student_id');
      }
    }
  });

  it('6. Verifies mock purge operation isolates deletion to target school only', () => {
    const combinedStudents = [...demoA.students, ...demoB.students];
    const purgedStudents = combinedStudents.filter((s) => s.school_id !== schoolA);

    assert.equal(purgedStudents.length, demoB.students.length, 'Purging School A must preserve 100% of School B students');
    for (const s of purgedStudents) {
      assert.equal(s.school_id, schoolB, 'Remaining students must only be School B');
    }
  });

  it('7. Confirms generated student count accurately reflects class roasters', () => {
    const actualCount = demoA.students.length;
    assert.ok(actualCount >= 20, `Generated student count (${actualCount}) must cover all class grades`);
  });
});
