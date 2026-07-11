<?php

namespace App\Constants;

final class RoleCode
{
    public const TEACHER = "giang_vien";
    public const SUBJECT_TEACHER = "giao_vien_bo_mon";
    public const HOMEROOM_TEACHER = "giao_vien_chu_nhiem";
    public const ADMIN = "admin";
    public const STUDENT = "sinh_vien";

    public const TEACHER_ROLES = [
        self::TEACHER,
        self::SUBJECT_TEACHER,
        self::HOMEROOM_TEACHER,
    ];
}
