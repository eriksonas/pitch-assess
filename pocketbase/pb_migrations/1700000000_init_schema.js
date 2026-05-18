/// <reference path="../pb_data/types.d.ts" />

// PitchAssess initial schema migration.
// Mirrors the original Supabase schema and per-user RLS policies.
// Auto-runs on PocketBase startup (automigrate=true).
//
// Strategy: each collection is created with fields first (no rules),
// saved, then rules are attached and the collection is saved again.
// This avoids a v0.38 quirk where rules can be validated before
// the field schema is fully registered.

migrate(
  (app) => {
    // ---------- helpers ----------
    const DOMAIN_VALUES = [
      "biotech",
      "photonics",
      "electronics",
      "medtech",
      "deeptech",
    ];
    const AUDIENCE_VALUES = [
      "startup-contest",
      "tech-transfer",
      "funding-agency",
      "venture-capital",
      "investor",
      "customer",
    ];
    const LANGUAGE_VALUES = ["en", "pl", "de", "lt"];

    const attachRules = (collection, rules) => {
      collection.listRule = rules.list ?? null;
      collection.viewRule = rules.view ?? null;
      collection.createRule = rules.create ?? null;
      collection.updateRule = rules.update ?? null;
      collection.deleteRule = rules.delete ?? null;
      app.save(collection);
    };

    // ---------- extend `users` ----------
    const users = app.findCollectionByNameOrId("users");
    users.fields.add(
      new TextField({ name: "full_name", required: true, max: 200 })
    );
    users.fields.add(new URLField({ name: "avatar_url", required: false }));
    users.fields.add(
      new SelectField({
        name: "role",
        required: true,
        values: ["user", "admin"],
        maxSelect: 1,
      })
    );
    app.save(users);
    const usersId = users.id;

    // ---------- projects ----------
    const projects = new Collection({
      type: "base",
      name: "projects",
      fields: [
        {
          name: "user",
          type: "relation",
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: "name", type: "text", required: true, max: 200 },
        { name: "description", type: "text", required: false, max: 2000 },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX `idx_projects_user` ON `projects` (`user`)",
        "CREATE INDEX `idx_projects_created` ON `projects` (`created` DESC)",
      ],
    });
    app.save(projects);
    attachRules(projects, {
      list: "user = @request.auth.id",
      view: "user = @request.auth.id",
      create: '@request.auth.id != "" && user = @request.auth.id',
      update: "user = @request.auth.id",
      delete: "user = @request.auth.id",
    });
    const projectsId = projects.id;

    // ---------- assessments ----------
    const assessments = new Collection({
      type: "base",
      name: "assessments",
      fields: [
        {
          name: "user",
          type: "relation",
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: "project",
          type: "relation",
          required: false,
          collectionId: projectsId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: "file_name", type: "text", required: true, max: 500 },
        {
          name: "file",
          type: "file",
          required: false,
          maxSelect: 1,
          maxSize: 104857600,
          mimeTypes: [
            "application/pdf",
            "audio/mpeg",
            "audio/wav",
            "audio/mp4",
            "audio/x-m4a",
            "video/mp4",
          ],
        },
        {
          name: "domain",
          type: "select",
          required: true,
          values: DOMAIN_VALUES,
          maxSelect: 1,
        },
        {
          name: "audience",
          type: "select",
          required: true,
          values: AUDIENCE_VALUES,
          maxSelect: 1,
        },
        {
          name: "language",
          type: "select",
          required: true,
          values: LANGUAGE_VALUES,
          maxSelect: 1,
        },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["processing", "completed", "failed"],
          maxSelect: 1,
        },
        {
          name: "overall_score",
          type: "number",
          required: false,
          min: 0,
          max: 10,
          onlyInt: false,
        },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX `idx_assessments_user` ON `assessments` (`user`)",
        "CREATE INDEX `idx_assessments_project` ON `assessments` (`project`)",
        "CREATE INDEX `idx_assessments_created` ON `assessments` (`created` DESC)",
      ],
    });
    app.save(assessments);
    attachRules(assessments, {
      list: "user = @request.auth.id",
      view: "user = @request.auth.id",
      create: '@request.auth.id != "" && user = @request.auth.id',
      update: "user = @request.auth.id",
      delete: "user = @request.auth.id",
    });
    const assessmentsId = assessments.id;

    // ---------- assessment_results ----------
    const assessmentResults = new Collection({
      type: "base",
      name: "assessment_results",
      fields: [
        {
          name: "assessment",
          type: "relation",
          required: true,
          collectionId: assessmentsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: "overall_feedback", type: "editor", required: false },
        {
          name: "overall_strengths",
          type: "text",
          required: false,
          max: 5000,
        },
        {
          name: "overall_weaknesses",
          type: "text",
          required: false,
          max: 5000,
        },
        {
          name: "section_scores",
          type: "json",
          required: false,
          maxSize: 200000,
        },
        { name: "strengths", type: "json", required: false, maxSize: 200000 },
        {
          name: "improvements",
          type: "json",
          required: false,
          maxSize: 200000,
        },
        {
          name: "recommendations",
          type: "json",
          required: false,
          maxSize: 200000,
        },
        {
          name: "next_steps",
          type: "json",
          required: false,
          maxSize: 200000,
        },
        {
          name: "detailed_analysis",
          type: "json",
          required: false,
          maxSize: 500000,
        },
        { name: "created", type: "autodate", onCreate: true },
      ],
      indexes: [
        "CREATE INDEX `idx_assessment_results_assessment` ON `assessment_results` (`assessment`)",
      ],
    });
    app.save(assessmentResults);
    attachRules(assessmentResults, {
      list: "assessment.user = @request.auth.id",
      view: "assessment.user = @request.auth.id",
      create: "assessment.user = @request.auth.id",
      update: "assessment.user = @request.auth.id",
      delete: "assessment.user = @request.auth.id",
    });

    // ---------- generated_pitches ----------
    const generatedPitches = new Collection({
      type: "base",
      name: "generated_pitches",
      fields: [
        {
          name: "user",
          type: "relation",
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: "assessment",
          type: "relation",
          required: false,
          collectionId: assessmentsId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: "pitch_content", type: "editor", required: true },
        { name: "title", type: "text", required: true, max: 300 },
        {
          name: "domain",
          type: "select",
          required: true,
          values: DOMAIN_VALUES,
          maxSelect: 1,
        },
        {
          name: "audience",
          type: "select",
          required: true,
          values: AUDIENCE_VALUES,
          maxSelect: 1,
        },
        {
          name: "language",
          type: "select",
          required: true,
          values: LANGUAGE_VALUES,
          maxSelect: 1,
        },
        { name: "main_idea", type: "text", required: true, max: 2000 },
        { name: "is_favorite", type: "bool", required: false },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX `idx_generated_pitches_user` ON `generated_pitches` (`user`)",
        "CREATE INDEX `idx_generated_pitches_assessment` ON `generated_pitches` (`assessment`)",
        "CREATE INDEX `idx_generated_pitches_created` ON `generated_pitches` (`created` DESC)",
        "CREATE INDEX `idx_generated_pitches_favorite` ON `generated_pitches` (`user`, `is_favorite`)",
      ],
    });
    app.save(generatedPitches);
    attachRules(generatedPitches, {
      list: "user = @request.auth.id",
      view: "user = @request.auth.id",
      create: '@request.auth.id != "" && user = @request.auth.id',
      update: "user = @request.auth.id",
      delete: "user = @request.auth.id",
    });
  },

  (app) => {
    for (const name of [
      "generated_pitches",
      "assessment_results",
      "assessments",
      "projects",
    ]) {
      try {
        const c = app.findCollectionByNameOrId(name);
        app.delete(c);
      } catch (_) {}
    }
    try {
      const users = app.findCollectionByNameOrId("users");
      for (const fname of ["full_name", "avatar_url", "role"]) {
        try {
          users.fields.removeByName(fname);
        } catch (_) {}
      }
      app.save(users);
    } catch (_) {}
  }
);
