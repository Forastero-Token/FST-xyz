;; Fundraising Campaign Contract
;; A simple contract to accept crypto donations in STX or sBTC.

;; Constants 
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-campaign-ended (err u101))
(define-constant err-goal-not-met (err u102))
(define-constant err-price-expired (err u103))
(define-constant err-campaign-not-ended (err u104))
(define-constant err-goal-met (err u105))
(define-constant err-already-initialized (err u106))

(define-constant default-duration u4320) ;; Duration in *Bitcoin* blocks. This default value means is if a block is 10 minutes, this is roughly 30 days.

;; Data vars
(define-data-var is-campaign-initialized bool false)
(define-data-var beneficiary principal contract-owner)
(define-data-var campaign-duration uint u173000)
(define-data-var campaign-start uint u0)
(define-data-var campaign-goal uint u0)
(define-data-var is-campaign-goal-met bool false) ;; because crypto prices fluctuate, this is a switch that gets turned on if at any point during the campaign, a donation is made which meets the goal.
(define-data-var total-stx uint u0) ;; in microstacks
(define-data-var total-sbtc uint u0) ;; in sats
(define-data-var donation-count uint u0)
(define-data-var is-campaign-withdrawn bool false)

;; Maps
(define-map stx-donations principal uint)  ;; donor -> amount
(define-map sbtc-donations principal uint) ;; donor -> amount

;; Initialize the campaign (goal is in US dollars)
;; Pass duration as 0 to use the default duration (~30 days)
;; Can only be called once
(define-public (initialize-campaign (goal uint) (duration uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (asserts! (not (var-get is-campaign-initialized)) err-already-initialized)
    (var-set is-campaign-initialized true)
    (var-set campaign-start burn-block-height)
    (var-set campaign-goal goal)
    (var-set campaign-duration duration)
    (var-set campaign-duration (if (is-eq duration u0) 
      default-duration
      duration))
    (ok true)))

;; Donate STX. Pass amount in microstacks.
(define-public (donate-stx (amount uint))
  (begin
    (asserts! (< burn-block-height (+ (var-get campaign-start) (var-get campaign-duration))) 
              err-campaign-ended)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set stx-donations tx-sender 
      (+ (default-to u0 (map-get? stx-donations tx-sender)) amount))
    (var-set total-stx (+ (var-get total-stx) amount))
    (var-set donation-count (+ (var-get donation-count) u1))
    (var-set is-campaign-goal-met (unwrap-panic (is-goal-met)))
    (ok true)))

;; Donate sBTC. Pass amount in Satoshis.
(define-public (donate-sbtc (amount uint))
  (begin
    (asserts! (< burn-block-height (+ (var-get campaign-start) (var-get campaign-duration))) 
              err-campaign-ended)
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
      amount 
      contract-caller
      (as-contract tx-sender) 
      none))
    (map-set sbtc-donations tx-sender
      (+ (default-to u0 (map-get? sbtc-donations tx-sender)) amount))
    (var-set total-sbtc (+ (var-get total-sbtc) amount))
    (var-set donation-count (+ (var-get donation-count) u1))
    (var-set is-campaign-goal-met (unwrap-panic (is-goal-met)))
    (ok true)))

(define-read-only (get-total-usd)
  (let (
    (pyth-sbtc-price-data (unwrap! 
      (contract-call?
        'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-oracle-v3
        read-price-feed
        0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43 ;; ID of the BTC price feed
        'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-storage-v3)
      err-code))
    (pyth-stx-price-data (unwrap! 
      (contract-call?
        'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-oracle-v3
        read-price-feed
        0xec7a775f46379b5e943c3526b1c8d54cd49749176b0b98e02dde68d1bd335c17 ;; ID of the STX price feed
        'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-storage-v3)
      err-code))
    (sbtc-oracle-price (get price pyth-sbtc-price-data))
    (stx-oracle-price (get price pyth-stx-price-data))
    ;; the price returned from the oracle: price * 10^(-5) = USD
    ;; See: https://docs.pyth.network/price-feeds/best-practices
    (sbtc-value (/ (* (var-get total-sbtc) sbtc-oracle-price) u100000000000000)) ;; total-sbtc is in Satoshis 
    (stx-value (/ (* (var-get total-stx) stx-oracle-price) u100000000000)) ;; total-stx is in microstacks
  )
    (ok (+ stx-value sbtc-value)))
)

;; Check if goal is met
(define-read-only (is-goal-met)
  (let (
    (total-value (unwrap! (get-total-usd) err-price-expired))
  )
    (ok (>= total-value (var-get campaign-goal)))))

;; Withdraw funds (only beneficiary, only if goal met, only if campaign is ended)
(define-public (withdraw)
  (let (
    (total-stx-amount (var-get total-stx))
    (total-sbtc-amount (var-get total-sbtc))
  )
    (asserts! (is-eq tx-sender (var-get beneficiary)) err-not-authorized)
    (asserts! (>= burn-block-height (+ (var-get campaign-start) (var-get campaign-duration)))
              err-campaign-not-ended)
    (asserts! (var-get is-campaign-goal-met) err-goal-not-met)
    (as-contract
      (begin
        (if (> total-stx-amount u0)
          (try! (stx-transfer? total-stx-amount (as-contract tx-sender) (var-get beneficiary)))
          true)
        (if (> total-sbtc-amount u0)
          (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
            total-sbtc-amount
            (as-contract tx-sender)
            (var-get beneficiary)
            none))
          true)
        (var-set is-campaign-withdrawn true)
        (ok true)))))

;; Refund if goal not met
;; Can only do this after the campaign has ended
(define-public (refund)
  (let (
    (stx-amount (default-to u0 (map-get? stx-donations tx-sender)))
    (sbtc-amount (default-to u0 (map-get? sbtc-donations tx-sender)))
    (contributor tx-sender)
  )
    (asserts! (>= burn-block-height (+ (var-get campaign-start) (var-get campaign-duration)))
              err-campaign-not-ended)
    (asserts! (not (var-get is-campaign-goal-met)) err-goal-met)
    (if (> stx-amount u0)
      (begin
        (as-contract
          (try! (stx-transfer? stx-amount tx-sender contributor))))
      true)
      (map-delete stx-donations tx-sender)
    (if (> sbtc-amount u0)
      (begin
        (as-contract
          (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
            sbtc-amount
            tx-sender
            contributor
            none))))
      true)
      (map-delete sbtc-donations tx-sender)
    (ok true)))

;; Getter functions
(define-read-only (get-stx-donation (donor principal))
  (ok (default-to u0 (map-get? stx-donations donor))))

(define-read-only (get-sbtc-donation (donor principal))
  (ok (default-to u0 (map-get? sbtc-donations donor))))

(define-read-only (get-campaign-info)
  (ok {
    start: (var-get campaign-start),
    end: (+ (var-get campaign-start) (var-get campaign-duration)),
    goal: (var-get campaign-goal),
    totalStx: (var-get total-stx),
    totalSbtc: (var-get total-sbtc),
    usdValue: (unwrap-panic (get-total-usd)),
    donationCount: (var-get donation-count),
    isExpired: (>= burn-block-height (+ (var-get campaign-start) (var-get campaign-duration))),
    isWithdrawn: (var-get is-campaign-withdrawn),
    isGoalMet: (var-get is-campaign-goal-met)
  }))

(define-read-only (get-contract-balance)
  (stx-get-balance (as-contract tx-sender)))