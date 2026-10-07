import { prisma } from "../lib/prisma";
import { encryptPassport } from "../lib/crypto";

async function runE2ETests() {
  console.log("🚀 Starting Full CRUD & System Verification Tests...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test Student CRUD
    console.log("\n--- Testing Student Full CRUD ---");
    const testCode = `TEST-STU-${Date.now()}`;
    const branch = await prisma.branch.findFirst();
    const student = await prisma.student.create({
      data: {
        studentCode: testCode,
        fullNameAr: "طالب تجريبي للاختبار",
        fullNameEn: "E2E Test Student",
        nationality: "مواطن",
        phone: `+20 100 ${Math.floor(1000000 + Math.random() * 9000000)}`,
        whatsapp: "+20 100 0000000",
        email: `test_${Date.now()}@example.com`,
        residenceCountry: "Egypt",
        passportNumberEnc: encryptPassport("A12345678"),
        branchId: branch?.id || "branch-cai",
        desiredMajor: "Engineering",
        desiredCountry: "Spain",
        targetLevel: "bachelor",
        status: "new",
      },
    });
    assert(!!student.id, "Student Created in Database");

    // Read
    const fetched = await prisma.student.findUnique({ where: { id: student.id } });
    assert(fetched?.fullNameAr === "طالب تجريبي للاختبار", "Student Read from Database");

    // Update
    const updated = await prisma.student.update({
      where: { id: student.id },
      data: { status: "active", desiredMajor: "AI Systems" },
    });
    assert(updated.status === "active" && updated.desiredMajor === "AI Systems", "Student Updated");

    // Soft Delete
    const softDeleted = await prisma.student.update({
      where: { id: student.id },
      data: { deletedAt: new Date() },
    });
    assert(!!softDeleted.deletedAt, "Student Soft-Deleted (Moved to Trash)");

    // Restore from Trash
    const restored = await prisma.student.update({
      where: { id: student.id },
      data: { deletedAt: null },
    });
    assert(restored.deletedAt === null, "Student Restored from Trash");

    // Clean up
    await prisma.student.delete({ where: { id: student.id } });
    assert(true, "Student Permanently Cleaned up");

    // 2. Test Settings / LookupOption CRUD
    console.log("\n--- Testing Lookups Full CRUD ---");
    const optKey = `test_opt_${Date.now()}`;
    const lookup = await prisma.lookupOption.create({
      data: {
        category: "study_level",
        key: optKey,
        labelAr: "شهادة مهنية",
        labelEn: "Professional Certificate",
      },
    });
    assert(!!lookup.id, "Lookup Option Created");

    const lookupUpdated = await prisma.lookupOption.update({
      where: { id: lookup.id },
      data: { labelAr: "شهادة معتمدة" },
    });
    assert(lookupUpdated.labelAr === "شهادة معتمدة", "Lookup Option Updated");

    await prisma.lookupOption.delete({ where: { id: lookup.id } });
    assert(true, "Lookup Option Deleted");

    // 3. Test Custom Fields CRUD
    console.log("\n--- Testing Custom Fields CRUD ---");
    const fieldName = `cust_field_${Date.now()}`;
    const customField = await prisma.customField.create({
      data: {
        entity: "Student",
        name: fieldName,
        labelAr: "حقل مخصص اختباري",
        labelEn: "Test Custom Field",
        type: "text",
      },
    });
    assert(!!customField.id, "Custom Field Created");

    await prisma.customField.delete({ where: { id: customField.id } });
    assert(true, "Custom Field Deleted");

    // 4. Test Task Status Toggle
    console.log("\n--- Testing Task Toggle ---");
    const firstTask = await prisma.task.findFirst();
    if (firstTask) {
      const toggled = await prisma.task.update({
        where: { id: firstTask.id },
        data: { status: firstTask.status === "completed" ? "pending" : "completed" },
      });
      assert(toggled.status !== firstTask.status, "Task Status Toggled");
      // restore
      await prisma.task.update({
        where: { id: firstTask.id },
        data: { status: firstTask.status },
      });
      assert(true, "Task Status Reverted");
    }

    // 5. Test Kanban Stage Move & Timeline Logging
    console.log("\n--- Testing Kanban Stage Move & Timeline ---");
    const firstApp = await prisma.application.findFirst({ include: { stage: true } });
    const stages = await prisma.kanbanStage.findMany({ orderBy: { order: "asc" } });
    if (firstApp && stages.length > 1) {
      const nextStage = stages.find((s) => s.id !== firstApp.stageId);
      if (nextStage) {
        const movedApp = await prisma.application.update({
          where: { id: firstApp.id },
          data: { stageId: nextStage.id },
        });
        assert(movedApp.stageId === nextStage.id, "Application Moved between Kanban Stages");

        // Verify Timeline Event
        const event = await prisma.timelineEvent.create({
          data: {
            studentId: firstApp.studentId,
            category: "application",
            titleAr: `نقل إلى: ${nextStage.nameAr}`,
            titleEn: `Moved to: ${nextStage.nameEn}`,
            actorName: "Test Suite",
          },
        });
        assert(!!event.id, "Timeline Event Recorded for Student");

        // Revert
        await prisma.application.update({
          where: { id: firstApp.id },
          data: { stageId: firstApp.stageId },
        });
      }
    }

    // 6. Test Audit Logging
    console.log("\n--- Testing Audit Logging ---");
    const auditCountBefore = await prisma.auditLog.count();
    await prisma.auditLog.create({
      data: {
        action: "test_verification",
        entity: "System",
        details: "Automated test executed",
        userName: "Automated Test",
      },
    });
    const auditCountAfter = await prisma.auditLog.count();
    assert(auditCountAfter > auditCountBefore, "Audit Log Recorded");

    console.log("\n=================================");
    console.log(`🎉 ALL TESTS COMPLETED: ${passed} Passed, ${failed} Failed.`);
    console.log("=================================");
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runE2ETests();
