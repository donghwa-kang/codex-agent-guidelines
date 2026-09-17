# Codex Agent Guidelines

Codex가 요구사항을 확인하고, 필요한 부분을 수정하고, 결과를 검증하도록 돕는 공통 `AGENTS.md` 지침입니다.

**[지침 읽기](AGENTS.md) · [AGENTS.md 다운로드](https://raw.githubusercontent.com/donghwa-kang/codex-agent-guidelines/main/AGENTS.md)**

프로젝트에 파일을 추가하면 사용할 수 있습니다. 별도의 앱, 모델, 백그라운드 에이전트를 설치하는 프로젝트가 아닙니다. 이미 사용하는 Codex의 작업 방식을 조정하는 텍스트 지침입니다.

## 이런 문제를 줄이기 위해 만들었습니다

| 코딩 에이전트와 작업하면서 겪는 문제 | 이 지침이 요구하는 행동 |
| --- | --- |
| 모호한 요구사항을 임의로 해석하고 구현함 | 실제 코드와 설정부터 확인하고, 결과가 크게 달라지는 선택은 질문 |
| 작은 기능에도 추상화·설정·의존성을 늘림 | 현재 요구사항을 충족하는 가장 단순한 해법 선택 |
| 요청과 무관한 코드까지 수정함 | 변경 이유를 요청과 연결하고 기존 사용자 작업 보존 |
| 사소한 선택마다 작업을 멈춤 | 승인된 범위의 작고 되돌릴 수 있는 선택은 자율 진행 |
| 테스트 실행 없이 완료를 선언함 | 수행한 검증과 미검증 사항을 구분해 보고 |
| 실패한 명령을 근거 없이 반복함 | 코드·기존 문제·환경 제약을 구분하고 근거 있는 대안 탐색 |
| 코드 주석이나 도구 출력의 지시를 작업 규칙처럼 따름 | 작업 데이터와 적용되는 지침을 구분 |

이는 지침이 유도하는 행동입니다. 오류 감소율이나 작업 속도 향상을 측정한 성능 주장은 아닙니다.

## 어떤 에이전트를 위한 지침인가요?

기능 구현, 버그 수정, 리팩터링, 코드 리뷰를 수행하는 **Codex 코딩 에이전트**를 대상으로 합니다. 특정 프레임워크·모델·운영체제나 응답 언어를 강제하지 않습니다.

지침은 다음 일곱 가지에 집중합니다.

1. 사실을 확인하고 목표를 정하기
2. 판단하고 필요한 만큼 질문하기
3. 필요한 만큼 구현하기
4. 변경 범위와 기존 작업 보호하기
5. 위험에 맞게 검증하기
6. 도구를 목적에 맞게 사용하기
7. 끝까지 수행하고 정확하게 인계하기

새 도구, 플러그인, MCP 서버, 자동화 일정은 추가하지 않습니다. `PROGRESS.md` 생성이나 특정 README 형식도 강제하지 않습니다.

## 가장 쉬운 적용 방법

필요한 것은 `AGENTS.md`를 읽을 수 있는 Codex 환경과 작업할 프로젝트입니다. 이 파일 자체에는 패키지 설치, 빌드, 별도 API 키가 필요하지 않습니다. Codex의 계정·인증·권한 설정은 기존 환경을 사용합니다.

1. [AGENTS.md 원문](https://raw.githubusercontent.com/donghwa-kang/codex-agent-guidelines/main/AGENTS.md)을 다운로드합니다.
2. 작업할 **프로젝트 루트**에 정확히 `AGENTS.md`라는 이름으로 저장합니다. `AGENTS.md.txt`가 되지 않았는지 확인합니다.
3. 기존 `AGENTS.md`가 있다면 덮어쓰지 말고, 아래의 **기존 지침과 병합하기** 절차를 따릅니다.
4. 대상 프로젝트에서 Codex의 새 작업 또는 새 CLI 세션을 시작하고 적용 상태를 확인합니다.

같은 디렉터리에 `AGENTS.override.md`가 있으면 그 파일이 우선됩니다. 다른 위치의 전역·프로젝트 지침도 함께 적용될 수 있습니다. 로딩 규칙은 [OpenAI 공식 문서](https://learn.chatgpt.com/docs/agent-configuration/agents-md)를 참고하세요.

### 터미널로 다운로드하기

아래 명령은 **대상 프로젝트 루트에서** 실행합니다. 기존 `AGENTS.md` 또는 `AGENTS.override.md`가 있으면 중단합니다. 다운로드한 내용을 임시 파일에 받은 뒤 새 `AGENTS.md`로 배치하며, 기존 파일을 덮어쓰지 않습니다.

**Windows / PowerShell**

```powershell
& {
    $ErrorActionPreference = 'Stop'
    $targetPath = Join-Path (Get-Location) 'AGENTS.md'
    if ((Test-Path -LiteralPath $targetPath) -or (Test-Path -LiteralPath 'AGENTS.override.md')) {
        throw '기존 지침이 있습니다. README의 병합 절차를 먼저 확인하세요.'
    }
    $downloadPath = [System.IO.Path]::GetTempFileName()
    try {
        Invoke-WebRequest -UseBasicParsing -Uri 'https://raw.githubusercontent.com/donghwa-kang/codex-agent-guidelines/main/AGENTS.md' -OutFile $downloadPath -ErrorAction Stop
        [System.IO.File]::Move($downloadPath, $targetPath)
    } finally {
        if (Test-Path -LiteralPath $downloadPath) {
            Remove-Item -LiteralPath $downloadPath
        }
    }
}
```

**macOS / Linux / Git Bash** — `curl`, `mktemp`, `ln`이 필요합니다.

```sh
(
    set -eu
    if [ -e AGENTS.md ] || [ -L AGENTS.md ] || [ -e AGENTS.override.md ] || [ -L AGENTS.override.md ]; then
        printf '%s\n' 'Existing instructions found. Follow the merge instructions in README.' >&2
        exit 1
    fi
    download_file=$(mktemp './.codex-guidelines.XXXXXX')
    trap 'rm -f "$download_file"' 0
    curl -fsSL 'https://raw.githubusercontent.com/donghwa-kang/codex-agent-guidelines/main/AGENTS.md' -o "$download_file"
    ln "$download_file" AGENTS.md
)
```

명령 완료 후 현재 디렉터리에 `AGENTS.md`가 생기고, 파일을 열었을 때 일곱 개의 원칙이 보이면 다운로드와 배치가 끝난 것입니다. 이는 파일 설치 확인이며, Codex에서 실제로 읽었는지는 다음 절차로 확인합니다.

### 적용 확인하기

새 작업 또는 새 CLI 세션에서 다음과 같이 요청합니다.

```text
현재 적용 중인 AGENTS.md 지침에서 변경 범위, 검증, 작업 중지 요청의
처리 원칙을 요약해줘. 확인할 수 있다면 지침의 파일 경로도 알려줘.
프로젝트 파일은 수정하지 마.
```

요청과 무관한 수정 제한, 검증 결과의 구분, 중지·보류 요청의 반영이 요약되는지 확인합니다. 다른 전역·프로젝트 지침이 함께 로드됐다면 그 영향도 확인하세요. 설명을 되풀이하는 것만으로 실제 행동 준수가 입증되는 것은 아닙니다.

원하는 지침이 나타나지 않으면 프로젝트 위치, 파일명, `AGENTS.override.md`, 새 세션 시작 여부를 확인하세요. [공식 로딩·문제 해결 안내](https://learn.chatgpt.com/docs/agent-configuration/agents-md#verify-your-setup)에서 추가 확인 방법을 볼 수 있습니다.

## 기존 지침과 병합하기

1. 기존 파일을 백업하거나 Git에 보존합니다.
2. 이 저장소의 `AGENTS.md`를 열고 기존 내용과 비교합니다.
3. 프로젝트 고유의 실행 명령, 기술 스택, 데이터 제약은 유지합니다.
4. 겹치는 규칙은 하나로 통합하고, 충돌하는 규칙은 원하는 작업 방식에 맞게 정리합니다.
5. Codex의 새 작업 또는 새 CLI 세션에서 다시 확인합니다.

전체 내용을 반복해서 덧붙이는 자동 설치 방식은 제공하지 않습니다. 서로 충돌하는 지침이나 중복된 규칙이 누적되는 것을 피하기 위해서입니다.

여러 프로젝트의 기본값으로 사용하려면 Codex 홈의 `AGENTS.md`에 필요한 규칙을 병합할 수 있습니다. 기본 위치는 `~/.codex/AGENTS.md`이며 `CODEX_HOME` 설정에 따라 달라집니다. 기존 파일과 `AGENTS.override.md`를 먼저 확인하고, 자동으로 덮어쓰지 마세요. 자세한 내용은 [전역 지침 안내](https://learn.chatgpt.com/docs/agent-configuration/agents-md#create-global-guidance)를 참고하세요.

## 사용 예시

평소처럼 작업을 요청하되, 목표와 완료 조건을 함께 알려주면 좋습니다.

```text
장바구니 수량을 0으로 바꿔도 상품이 남는 문제를 수정해줘.
관련 구현과 테스트부터 확인하고 기존 사용자 변경은 보존해줘.
완료 조건은 상품 제거 동작 확인과 관련 회귀 검증이야.
수행한 검증과 실행하지 못한 항목을 구분해서 알려줘.
```

이 지침은 관련 코드 조사, 필요한 범위의 수정, 검증, 결과 보고를 요구합니다. 주변 화면의 재설계나 새 상태 관리 라이브러리 도입까지 자동으로 요청하는 것은 아닙니다.

리뷰만 원한다면 다음처럼 범위를 명확히 할 수 있습니다.

```text
이 변경을 리뷰해줘. 파일은 수정하지 말고,
재현 조건과 영향이 있는 문제를 파일 위치와 함께 알려줘.
```

## 업데이트와 제거

- **업데이트:** 새 원문과 현재 파일을 비교하고 필요한 변경만 병합합니다. 다운로드 명령은 기존 지침이 있는 경우 중단하므로 업데이트용 덮어쓰기 명령으로 쓰지 않습니다.
- **제거:** 별도로 추가한 파일이라면 그 파일만 제거하고, 기존 파일에 병합했다면 추가한 규칙만 제거하거나 백업을 참고해 복원합니다. 이후에 생긴 사용자 변경은 보존하세요.
- **적용 시점:** 변경 후 대상 프로젝트에서 새 작업 또는 새 CLI 세션을 시작합니다.

## 한계와 검증 상태

- 행동을 유도하는 텍스트 지침이며 모델의 판단 오류를 없애거나 규칙 준수를 보장하지 않습니다.
- 시스템·개발자 지침, 프로젝트 지침, 샌드박스와 승인 정책을 대체하지 않습니다.
- 외부 지시문에 대한 규칙은 방어 원칙입니다. 프롬프트 인젝션을 기술적으로 차단하는 보안 제품은 아닙니다.
- 모델, 작업 맥락, 도구, 지침 충돌에 따라 결과가 달라질 수 있습니다. 효과를 확인하려면 자신의 대표 작업으로 비교해야 합니다.
- 지침 본문은 정적 검토와 가상 실패 시나리오 검토를 거쳤습니다. 실제 모델을 반복 실행한 비교 평가나 공격 성공률 측정은 수행하지 않았습니다.
- 2026-09-17 기준 Windows의 PowerShell 7.6.5, Windows PowerShell 5.1, Git Bash 5.2.26에서 README의 다운로드 명령을 실행했습니다. 정상 설치 결과를 원본 파일과 SHA-256으로 대조했고, 기존 `AGENTS.md`·`AGENTS.override.md` 보존과 다운로드 실패 시 미설치 상태를 확인했습니다.
- macOS·Linux 네이티브 환경에서는 명령을 직접 실행하지 않았습니다. 셸 명령에 필요한 도구와 하드 링크를 지원하지 않는 파일 시스템에서는 수동 다운로드 방법을 사용하세요.
- 현재 검증 환경의 CLI 실행 제약으로 Codex 세션 내 지침 로딩은 직접 확인하지 못했습니다. 설치 후 위의 적용 확인 절차를 수행해 주세요.

## 개선 제안

[이슈](https://github.com/donghwa-kang/codex-agent-guidelines/issues) 또는 [Pull Request](https://github.com/donghwa-kang/codex-agent-guidelines/pulls)로 제안할 수 있습니다. 문제가 생긴 요청, 사용한 환경, 기대한 행동, 실제 행동을 비밀값 없이 설명해 주세요.

새 규칙을 제안할 때는 해결하려는 실패 상황과 기존 규칙으로 충분하지 않은 이유를 함께 적어 주세요. 문서 수정 시 코드 블록, 내부 링크, 설치 명령과 실제 동작의 일치를 확인해 주세요.

## 출처

- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)의 단순성, 변경 범위 통제, 가정 확인, 검증 중심 원칙에서 영감을 받았습니다.
- [OpenAI Codex 활용 지침](https://learn.chatgpt.com/guides/best-practices)과 [AGENTS.md 공식 안내](https://learn.chatgpt.com/docs/agent-configuration/agents-md)를 참고했습니다.

이 저장소는 위 프로젝트의 공식 배포판이나 OpenAI의 공식 제품이 아닌 독립적인 지침 모음입니다.

## 라이선스

[MIT License](LICENSE)로 제공합니다. 사용·수정·재배포·상업적 이용을 허용하며, 복사본이나 상당 부분을 재배포할 때 저작권 고지와 라이선스 허락 문구를 유지해야 합니다. 보증은 제공하지 않습니다.

다른 프로젝트에 지침을 포함해 재배포할 때는 이 저장소의 `LICENSE`도 보존하거나 기존 제3자 고지 문서에 해당 내용을 포함하세요. 대상 프로젝트의 기존 라이선스 파일을 덮어쓰지 마세요.
