def ordinal(n):
    return "th" if 11 <= (n % 100) <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")

def get_kcse_grade(score: float) -> str:
    if score >= 80:
        return "A"
    elif score >= 75:
        return "A-"
    elif score >= 70:
        return "B+"
    elif score >= 65:
        return "B"
    elif score >= 60:
        return "B-"
    elif score >= 55:
        return "C+"
    elif score >= 50:
        return "C"
    elif score >= 45:
        return "C-"
    elif score >= 40:
        return "D+"
    elif score >= 35:
        return "D"
    elif score >= 30:
        return "D-"
    else:
        return "F"
