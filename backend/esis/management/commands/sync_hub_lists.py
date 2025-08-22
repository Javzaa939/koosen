from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Sync esis public service"

    def handle(self, *args, **kwargs):

        from esis.models.hub import Program, ProgramStage, ProgramStagePlan, Teacher
        from esis.services.hub import (
            sync_course,
            sync_group_list,
            sync_program_list,
            sync_program_stage,
            sync_program_stage_plan,
            sync_student_list,
            sync_teacher_list,
            sync_teacher_profile,
        )

        sync_teacher_list()

        teachers = Teacher.objects.all().values_list("person_id", flat=True)
        for id in teachers:
            sync_teacher_profile(id)

        sync_student_list()
        sync_program_list()
        sync_group_list()

        programs = Program.objects.all().values_list("program_of_study_id", flat=True)
        for item in list(programs):
            sync_program_stage(item)

        program_stages = ProgramStage.objects.all().values_list(
            "program_stage_id", flat=True
        )
        for item in list(programs):
            for stage in program_stages:
                sync_program_stage_plan(item, stage)

        plans = ProgramStagePlan.objects.all().values_list("program_plan_id", flat=True)
        for item in programs:
            for stage in program_stages:
                for plan in plans:
                    sync_course(item, stage, plan)
